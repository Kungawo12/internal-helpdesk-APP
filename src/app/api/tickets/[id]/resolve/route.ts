import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTicketResolvedEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";
import { evaluateRules } from "@/lib/automationEngine";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, id: userId } = session.user;
    if (role !== "it_staff" && role !== "hr_staff" && role !== "admin") {
      return Response.json({ error: "Only staff can resolve tickets" }, { status: 403 });
    }

    const { solution, status } = await req.json();
    const { id } = await params;

    if (status === "resolved" && (!solution || solution.trim().length < 5)) {
      return Response.json(
        { error: "A solution description is required when resolving a ticket" },
        { status: 400 }
      );
    }

    const before = await prisma.ticket.findUnique({ where: { id }, select: { status: true } });

    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        solution: solution?.trim() || undefined,
        status: status || "resolved",
        assigneeId: userId,
        // slaFirstResponseMet is set on first public staff comment, not here
      },
      include: {
        creator: { select: { email: true, name: true } },
      },
    });

    // Audit log status change
    if (before?.status !== ticket.status) {
      logAudit(id, userId, status === "resolved" ? "RESOLVED" : "STATUS_CHANGED", {
        field: "status",
        oldValue: before?.status ?? "unknown",
        newValue: ticket.status,
      }).catch(() => {});
    }

    // Re-evaluate rules after status change (e.g. in_progress triggers escalation)
    evaluateRules(id).catch(() => {});

    if (status === "resolved") {
      notify(ticket.creatorId, "TICKET_RESOLVED", `Your ticket "${ticket.title}" has been resolved.`, id).catch(() => {});
    }
    if (status === "in_progress") {
      notify(ticket.creatorId, "TICKET_IN_PROGRESS", `Your ticket "${ticket.title}" is now being worked on.`, id).catch(() => {});
    }

    if (status === "resolved" && ticket.creator.email) {
      sendTicketResolvedEmail(
        ticket.creator.email,
        ticket.title,
        ticket.id,
        solution,
        session.user.name
      ).catch(() => {});
    }


    return Response.json(ticket);
  } catch (error) {
    console.error("Resolve ticket error:", error);
    return Response.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}
