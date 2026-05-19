import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";

const PRIORITY_ORDER = ["low", "medium", "high", "urgent"] as const;
type Priority = (typeof PRIORITY_ORDER)[number];

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { role, id: userId } = session.user;
    if (role !== "it_staff" && role !== "hr_staff" && role !== "ai_staff" && role !== "admin") {
      return Response.json({ error: "Only staff can escalate tickets" }, { status: 403 });
    }

    const { id } = await params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { priority: true, title: true, status: true },
    });

    if (!ticket) return Response.json({ error: "Ticket not found" }, { status: 404 });

    if (ticket.status === "resolved" || ticket.status === "closed") {
      return Response.json({ error: "Cannot escalate a resolved ticket" }, { status: 400 });
    }

    const currentIndex = PRIORITY_ORDER.indexOf(ticket.priority as Priority);
    if (currentIndex === -1 || currentIndex === PRIORITY_ORDER.length - 1) {
      return Response.json({ error: "Ticket is already at urgent priority" }, { status: 400 });
    }

    const newPriority = PRIORITY_ORDER[currentIndex + 1];

    const updated = await prisma.ticket.update({
      where: { id },
      data: { priority: newPriority },
    });

    logAudit(id, userId, "PRIORITY_CHANGED", {
      field: "priority",
      oldValue: ticket.priority,
      newValue: newPriority,
    }).catch(() => {});

    // In-app notifications for all admins
    prisma.user.findMany({
      where: { role: "admin", active: true },
      select: { id: true },
    }).then((admins) => {
      return Promise.all(admins.map((a) =>
        notify(a.id, "TICKET_ESCALATED", `Ticket "${ticket.title}" escalated to ${newPriority.toUpperCase()}.`, id)
      ));
    }).catch(() => {});

    // Email all admins non-blocking
    prisma.user.findMany({
      where: { role: "admin", active: true },
      select: { email: true },
    }).then(async (admins) => {
      const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const ticketUrl = `${appUrl}/dashboard/ticket/${id}`;
      const subject = `⬆ Escalated to ${newPriority.toUpperCase()}: ${ticket.title}`;
      // We use sendTicketCreatedEmail as a close analogue — build raw html here
      const nodemailer = await import("nodemailer");
      const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
      if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return;
      const transporter = nodemailer.default.createTransport({
        host: SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
      const html = `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#dc2626;">Ticket Escalated to ${newPriority.toUpperCase()}</h2>
        <p><strong>${ticket.title}</strong> has been escalated from <em>${ticket.priority}</em> to <strong>${newPriority}</strong>.</p>
        <a href="${ticketUrl}" style="display:inline-block;background:#0f172a;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:700;">View Ticket →</a>
      </div>`;
      await Promise.all(admins.map((a) => transporter.sendMail({ from: `"Helpdesk" <${SMTP_FROM || SMTP_USER}>`, to: a.email, subject, html })));
    }).catch(() => {});

    return Response.json(updated);
  } catch (error) {
    console.error("Escalate error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to escalate ticket" }, { status: 500 });
  }
}
