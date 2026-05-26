import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";
import { escapeHtml } from "@/lib/utils";
import crypto from "crypto";

// L-3 fix: use SHA-256 wrapping so both sides are always equal length,
// eliminating the early return false on length mismatch which is a
// minor timing oracle. Consistent with the pattern used for passkeys.
function verifyCronSecret(provided: string | null): boolean {
const expected = process.env.CRON_SECRET;
if (!provided || !expected) return false;
// Hash both to equal-length buffers -- timingSafeEqual throws on length mismatch
const ha = crypto.createHash("sha256").update(provided).digest();
const hb = crypto.createHash("sha256").update(`Bearer ${expected}`).digest();
return crypto.timingSafeEqual(ha, hb);
}

// Vercel Cron — runs every 5 minutes (configured in vercel.json)
export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Mark tickets whose first response deadline was missed and not yet flagged
  const firstResponseMissed = await prisma.ticket.findMany({
    where: {
      status: { notIn: ["resolved"] },
      slaFirstResponseDue: { lt: now },
      slaFirstResponseMet: false,
      slaBreached: false,
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
    await prisma.ticket.updateMany({
      where: { id: { in: breached.map((t) => t.id) } },
      data: { slaBreached: true },
    });

    const managers = await prisma.user.findMany({
      where: { role: "admin", active: true },
      select: { email: true, name: true },
    });

    for (const ticket of breached) {
      logAudit(ticket.id, "system", "SLA_BREACHED", {
        field: "slaBreached",
        oldValue: "false",
        newValue: "true",
      }).catch((err) => console.error(`[SLA] logAudit SLA_BREACHED failed for ${ticket.id}:`, err instanceof Error ? err.message : err));

      for (const manager of managers) {
        sendSlaBreachEmail(manager.email, manager.name, ticket).catch((err) =>
          console.error(`[SLA] breach email to ${manager.email} failed:`, err instanceof Error ? err.message : err)
        );
      }
    }
  }

  // Find tickets approaching breach (within 1 hour) — warn once per ticket
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
      slaResolutionDue: true,
      assigneeId: true,
      assignee: { select: { id: true, name: true, email: true } },
    },
  });

  for (const ticket of atRisk) {
    const alreadyNotified = await prisma.auditLog.findFirst({
      where: { ticketId: ticket.id, action: "SLA_AT_RISK" },
    });
    if (!alreadyNotified) {
      logAudit(ticket.id, "system", "SLA_AT_RISK", {
        field: "slaResolutionDue",
        newValue: ticket.slaResolutionDue?.toISOString(),
      }).catch((err) => console.error(`[SLA] logAudit SLA_AT_RISK failed for ${ticket.id}:`, err instanceof Error ? err.message : err));

      if (ticket.assignee?.id) {
        notify(
          ticket.assignee.id,
          "TICKET_ESCALATED",
          `SLA at risk: "${ticket.title}" is due within 1 hour.`,
          ticket.id
        ).catch((err) => console.error(`[SLA] notify for at-risk ticket ${ticket.id} failed:`, err instanceof Error ? err.message : err));
      }
    }
  }

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

  // H3: fail-fast if NEXTAUTH_URL is missing — never fall back to localhost in email links
  const appUrl = process.env.NEXTAUTH_URL;
  if (!appUrl) {
    console.error("[sla-check] NEXTAUTH_URL is not set — skipping email send");
    return;
  }

  const nodemailer = await import("nodemailer");
  const ticketUrl = `${appUrl}/dashboard/ticket/${ticket.id}`;

  // L6: requireTLS prevents STARTTLS downgrade to plaintext
  const transporter = nodemailer.default.createTransport({
    host: SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    requireTLS: true,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  // H4: escape every user-controlled field before embedding in HTML
  const safeManagerName = escapeHtml(managerName);
  const safeTitle = escapeHtml(ticket.title);
  const safeCreatorName = escapeHtml(ticket.creator.name);
  const safePriority = escapeHtml(ticket.priority.toUpperCase());

  const from = process.env.SMTP_FROM || SMTP_USER;

  await transporter.sendMail({
    from: `"Helpdesk" <${from}>`,
    to: managerEmail,
    subject: `SLA Breached: ${safeTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px 16px;">
        <div style="background:#0f172a;border-radius:12px;padding:24px 32px;margin-bottom:24px;text-align:center;">
          <span style="color:white;font-size:22px;font-weight:900;">Helpdesk</span>
        </div>
        <div style="background:white;border-radius:12px;padding:32px;border:1px solid #fca5a5;">
          <div style="display:inline-flex;align-items:center;gap:8px;background:#fef2f2;border:1px solid #fca5a5;border-radius:20px;padding:6px 14px;margin-bottom:20px;">
            <span style="color:#dc2626;font-size:14px;">&#9888;</span>
            <span style="color:#dc2626;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">SLA Breached</span>
          </div>
          <h1 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#0f172a;">Action Required, ${safeManagerName}</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#64748b;">The following ticket has exceeded its SLA resolution time:</p>
          <div style="background:#fef2f2;border-radius:8px;padding:20px;margin-bottom:24px;border-left:4px solid #dc2626;">
            <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#0f172a;">${safeTitle}</p>
            <p style="margin:0;font-size:12px;color:#64748b;">Raised by: ${safeCreatorName} &nbsp;|&nbsp; Priority: <strong>${safePriority}</strong></p>
          </div>
          <a href="${ticketUrl}" style="display:inline-block;background:#dc2626;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">
            View Ticket &amp; Escalate &rarr;
          </a>
        </div>
      </div>
    `,
  });
}
