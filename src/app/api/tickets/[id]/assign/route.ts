import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTicketAssignedEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: ticketId } = await params;
    const { assigneeId }: { assigneeId: string | null } = await req.json();

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (assigneeId) {
      const assignee = await prisma.user.findUnique({ where: { id: assigneeId } });
      if (!assignee) {
        return NextResponse.json({ error: "Assignee not found" }, { status: 404 });
      }

      const validRole =
        (ticket.type === "IT" && assignee.role === "it_staff") ||
        (ticket.type === "Software" && assignee.role === "ai_staff") ||
        (ticket.type === "HR" && assignee.role === "hr_staff");

      if (!validRole) {
        return NextResponse.json(
          { error: "Assignee role does not match ticket type" },
          { status: 400 }
        );
      }

      await prisma.ticket.update({
        where: { id: ticketId },
        data: { assigneeId },
      });

      logAudit(ticketId, session.user.id, "ASSIGNED", {
        field: "assigneeId",
        oldValue: ticket.assigneeId ?? "unassigned",
        newValue: assignee.name,
      }).catch(() => {});

      sendTicketAssignedEmail(
        assignee.email,
        assignee.name,
        ticket.title,
        ticket.type,
        ticketId,
        session.user.name ?? "Staff"
      ).catch(() => {});

      notify(assignee.id, "TICKET_ASSIGNED", `You have been assigned: "${ticket.title}"`, ticketId).catch(() => {});
    } else {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { assigneeId: null },
      });

      logAudit(ticketId, session.user.id, "UNASSIGNED", {
        field: "assigneeId",
        oldValue: ticket.assigneeId ?? "unassigned",
        newValue: "unassigned",
      }).catch(() => {});
    }

    const updated = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        creator: { select: { name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true, role: true } },
        feedback: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Assign ticket error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to assign ticket" }, { status: 500 });
  }
}
