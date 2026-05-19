import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { id: userId } = session.user;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { creatorId: true, status: true, title: true, assigneeId: true },
    });

    if (!ticket) return Response.json({ error: "Ticket not found" }, { status: 404 });

    // Only the creator (or admin) can reopen
    if (ticket.creatorId !== userId && session.user.role !== "admin") {
      return Response.json({ error: "Only the ticket creator can reopen it" }, { status: 403 });
    }

    if (ticket.status !== "resolved" && ticket.status !== "closed") {
      return Response.json({ error: "Only resolved or closed tickets can be reopened" }, { status: 400 });
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: { status: "open", solution: null },
    });

    logAudit(id, userId, "STATUS_CHANGED", {
      field: "status",
      oldValue: ticket.status,
      newValue: "open",
    }).catch(() => {});

    // Notify the assignee (if any) that the ticket was reopened
    if (ticket.assigneeId) {
      notify(ticket.assigneeId, "TICKET_REOPENED", `Ticket "${ticket.title}" has been reopened.`, id).catch(() => {});
    }

    return Response.json(updated);
  } catch (error) {
    console.error("Reopen ticket error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to reopen ticket" }, { status: 500 });
  }
}
