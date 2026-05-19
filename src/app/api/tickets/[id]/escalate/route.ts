import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";
import { sendTicketEscalatedEmail } from "@/lib/email";
import { isStaffOrAbove } from "@/lib/ticketAccess";

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
    if (!isStaffOrAbove(role)) {
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

    // Fetch admins once — use for both in-app notifications and emails
    prisma.user.findMany({
      where: { role: "admin", active: true },
      select: { id: true, email: true },
    }).then((admins) => {
      return Promise.all([
        ...admins.map((a) =>
          notify(a.id, "TICKET_ESCALATED", `Ticket "${ticket.title}" escalated to ${newPriority.toUpperCase()}.`, id)
        ),
        ...admins.map((a) =>
          sendTicketEscalatedEmail(a.email, ticket.title, id, ticket.priority, newPriority)
        ),
      ]);
    }).catch(() => {});

    return Response.json(updated);
  } catch (error) {
    console.error("Escalate error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to escalate ticket" }, { status: 500 });
  }
}
