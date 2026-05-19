import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTicketResolvedEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";
import { evaluateRules } from "@/lib/automationEngine";
import { isStaffOrAbove, canAccessTicket } from "@/lib/ticketAccess";

import type { TicketStatus } from "@prisma/client";

const VALID_STATUSES = ["resolved", "in_progress", "open"] as const;
type ValidStatus = (typeof VALID_STATUSES)[number];

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

    // Only staff roles can update ticket status
    if (!isStaffOrAbove(role)) {
      return Response.json({ error: "Only staff can update ticket status" }, { status: 403 });
    }

    const { solution, status: rawStatus } = await req.json();

    // Validate the status value explicitly — never accept arbitrary strings
    const status: ValidStatus = VALID_STATUSES.includes(rawStatus) ? rawStatus : "resolved";

    const { id } = await params;

    if (status === "resolved" && (!solution || solution.trim().length < 5)) {
      return Response.json(
        { error: "A solution description is required when resolving a ticket" },
        { status: 400 }
      );
    }

    // Fetch ticket to check type-based access (e.g. hr_staff can't resolve an IT ticket)
    const existing = await prisma.ticket.findUnique({
      where: { id },
      select: { status: true, type: true, creatorId: true },
    });
    if (!existing) {
      return Response.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (!canAccessTicket(role, userId, existing)) {
      return Response.json({ error: "You can only update tickets for your department" }, { status: 403 });
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        solution: solution?.trim() || undefined,
        status,
        assigneeId: userId,
      },
      include: {
        creator: { select: { email: true, name: true, id: true } },
      },
    });

    if (existing.status !== ticket.status) {
      logAudit(id, userId, status === "resolved" ? "RESOLVED" : "STATUS_CHANGED", {
        field: "status",
        oldValue: existing.status,
        newValue: ticket.status,
      }).catch(() => {});
    }

    evaluateRules(id).catch(() => {});

    if (status === "resolved") {
      notify(ticket.creatorId, "TICKET_RESOLVED", `Your ticket "${ticket.title}" has been resolved.`, id).catch(() => {});
      if (ticket.creator.email) {
        sendTicketResolvedEmail(
          ticket.creator.email,
          ticket.title,
          ticket.id,
          solution,
          session.user.name ?? "Staff"
        ).catch(() => {});
      }
    }

    if (status === "in_progress") {
      notify(ticket.creatorId, "TICKET_IN_PROGRESS", `Your ticket "${ticket.title}" is now being worked on.`, id).catch(() => {});
    }

    return Response.json(ticket);
  } catch (error) {
    console.error("Resolve ticket error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}
