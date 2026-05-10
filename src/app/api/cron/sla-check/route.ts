import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { sendTicketCreatedEmail } from "@/lib/email";

// Vercel Cron — runs every 5 minutes (configured in vercel.json)
// Protected by CRON_SECRET header
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Mark tickets whose first response deadline was missed and not yet flagged
  const firstResponseMissed = await prisma.ticket.findMany({
    where: {
      status: { notIn: ["resolved"] },
      slaFirstResponseDue: { lt: now },
      slaFirstResponseMet: false,
    },
    select: { id: true },
  });

  if (firstResponseMissed.length > 0) {
    await prisma.ticket.updateMany({
      where: { id: { in: firstResponseMissed.map((t) => t.id) } },
      data: { slaBreached: true },
    });
  }

  // Find tickets that have breached SLA resolution time and aren't yet marked
  const breached = await prisma.ticket.findMany({
    where: {
      status: { notIn: ["resolved"] },
      slaResolutionDue: { lt: now },
      slaBreached: false,
    },
    include: {
      creator: { select: { name: true } },
      assignee: { select: { name: true, email: true } },
    },
  });

  if (breached.length > 0) {
    // Mark all breached tickets
    await prisma.ticket.updateMany({
      where: { id: { in: breached.map((t) => t.id) } },
      data: { slaBreached: true },
    });

    // Fetch managers to notify
    const managers = await prisma.user.findMany({
      where: { role: "admin", active: true },
      select: { email: true, name: true },
    });

    // Log audit + send escalation emails (non-blocking)
    for (const ticket of breached) {
      logAudit(ticket.id, "system", "SLA_BREACHED" as any, {
        field: "slaBreached",
        oldValue: "false",
        newValue: "true",
      }).catch(() => {});

      // Notify managers about each breach
      for (const manager of managers) {
        sendSlaBreachEmail(manager.email, manager.name, ticket).catch(() => {});
      }
    }
  }

  // Find tickets approaching breach (within 1 hour) — send at-risk warning once
  const atRisk = await prisma.ticket.findMany({
    where: {
      status: { notIn: ["resolved"] },
      slaResolutionDue: {
        gt: now,
        lt: new Date(now.getTime() + 60 * 60 * 1000),
      },
      slaBreached: false,
    },
    select: {
      id: true,
      title: true,
      priority: true,
      assignee: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({
    checked: new Date().toISOString(),
    firstResponseBreached: firstResponseMissed.length,
    resolutionBreached: breached.length,
    atRisk: atRisk.length,
  });
}

async function sendSlaBreachEmail(
  managerEmail: string,
  managerName: string,
  ticket: { id: string; title: string; priority: string; creator: { name: string } }
) {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return;

  const nodemailer = await import("nodemailer");
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const ticketUrl = `${appUrl}/dashboard/ticket/${ticket.id}`;

  const transporter = nodemailer.default.createTransport({
    host: SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const from = process.env.SMTP_FROM || SMTP_USER;

  await transporter.sendMail({
    from: `"Helpdesk" <${from}>`,
    to: managerEmail,
    subject: `⚠️ SLA Breached: ${ticket.title}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px 16px;">
        <div style="background:#0f172a;border-radius:12px;padding:24px 32px;margin-bottom:24px;text-align:center;">
          <span style="color:white;font-size:22px;font-weight:900;">Helpdesk</span>
        </div>
        <div style="background:white;border-radius:12px;padding:32px;border:1px solid #fca5a5;">
          <div style="display:inline-flex;align-items:center;gap:8px;background:#fef2f2;border:1px solid #fca5a5;border-radius:20px;padding:6px 14px;margin-bottom:20px;">
            <span style="color:#dc2626;font-size:14px;">⚠</span>
            <span style="color:#dc2626;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">SLA Breached</span>
          </div>
          <h1 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#0f172a;">Action Required, ${managerName}</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#64748b;">The following ticket has exceeded its SLA resolution time:</p>
          <div style="background:#fef2f2;border-radius:8px;padding:20px;margin-bottom:24px;border-left:4px solid #dc2626;">
            <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#0f172a;">${ticket.title}</p>
            <p style="margin:0;font-size:12px;color:#64748b;">Raised by: ${ticket.creator.name} &nbsp;|&nbsp; Priority: <strong>${ticket.priority.toUpperCase()}</strong></p>
          </div>
          <a href="${ticketUrl}" style="display:inline-block;background:#dc2626;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">
            View Ticket &amp; Escalate →
          </a>
        </div>
      </div>
    `,
  });
}
