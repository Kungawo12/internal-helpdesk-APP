import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function evaluateRules(ticketId: string): Promise<void> {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, type: true, priority: true, status: true, assigneeId: true, title: true },
    });
    if (!ticket) return;

    const rules = await prisma.automationRule.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
    });

    for (const rule of rules) {
      // Check all conditions (null = any)
      if (rule.condTicketType && rule.condTicketType !== ticket.type) continue;
      if (rule.condPriority && rule.condPriority !== ticket.priority) continue;
      if (rule.condStatus && rule.condStatus !== ticket.status) continue;
      if (rule.condUnassigned && ticket.assigneeId !== null) continue;

      // Execute action
      if (rule.action === "assign_to_role" && rule.actionValue) {
        if (ticket.assigneeId) continue; // already assigned

        // Find staff member with fewest open assigned tickets
        const staffMembers = await prisma.user.findMany({
          where: { role: rule.actionValue, active: true },
          select: { id: true, name: true },
        });
        if (staffMembers.length === 0) continue;

        const loadCounts = await Promise.all(
          staffMembers.map(async (s) => ({
            id: s.id,
            name: s.name,
            load: await prisma.ticket.count({
              where: { assigneeId: s.id, status: { in: ["open", "in_progress"] } },
            }),
          }))
        );
        const leastLoaded = loadCounts.sort((a, b) => a.load - b.load)[0];

        await prisma.ticket.update({
          where: { id: ticketId },
          data: { assigneeId: leastLoaded.id },
        });
        logAudit(ticketId, "system", "ASSIGNED" as any, {
          field: "assigneeId",
          oldValue: "unassigned",
          newValue: `${leastLoaded.name} (auto)`,
        }).catch(() => {});

      } else if (rule.action === "escalate_priority" && rule.actionValue) {
        const priorityOrder = ["low", "medium", "high", "urgent"];
        const currentIdx = priorityOrder.indexOf(ticket.priority);
        const newIdx = priorityOrder.indexOf(rule.actionValue);
        if (newIdx <= currentIdx) continue; // only escalate, never de-escalate

        await prisma.ticket.update({
          where: { id: ticketId },
          data: { priority: rule.actionValue },
        });
        logAudit(ticketId, "system", "PRIORITY_CHANGED" as any, {
          field: "priority",
          oldValue: ticket.priority,
          newValue: rule.actionValue,
        }).catch(() => {});

      } else if (rule.action === "notify_admins") {
        const admins = await prisma.user.findMany({
          where: { role: "admin", active: true },
          select: { email: true, name: true },
        });
        for (const admin of admins) {
          sendAutomationEmail(admin.email, admin.name, rule.name, ticket.title, ticketId).catch(() => {});
        }
      }
    }
  } catch {
    // Never crash the caller
  }
}

async function sendAutomationEmail(
  to: string,
  name: string,
  ruleName: string,
  ticketTitle: string,
  ticketId: string
) {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return;

  const nodemailer = await import("nodemailer");
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const transporter = nodemailer.default.createTransport({
    host: SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"Helpdesk" <${process.env.SMTP_FROM || SMTP_USER}>`,
    to,
    subject: `⚡ Automation: ${ruleName}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;">
        <div style="background:#0f172a;border-radius:12px;padding:24px 32px;margin-bottom:24px;text-align:center;">
          <span style="color:white;font-size:22px;font-weight:900;">Helpdesk</span>
        </div>
        <div style="background:white;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
          <h1 style="margin:0 0 8px;font-size:18px;font-weight:800;color:#0f172a;">Automation rule triggered</h1>
          <p style="color:#64748b;font-size:14px;margin:0 0 20px;">Hi ${name}, the rule <strong>"${ruleName}"</strong> fired on a ticket.</p>
          <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:24px;">
            <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;">${ticketTitle}</p>
          </div>
          <a href="${appUrl}/dashboard/ticket/${ticketId}" style="display:inline-block;background:#0f172a;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">View Ticket →</a>
        </div>
      </div>
    `,
  });
}
