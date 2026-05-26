import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaffOrAbove, canAccessTicket } from "@/lib/ticketAccess";
import { updateTicketStatus } from "@/lib/ticketService";

const VALID_STATUSES = ["resolved", "in_progress", "open"] as const;
type ValidStatus = (typeof VALID_STATUSES)[number];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { role, id: userId } = session.user;
    if (!isStaffOrAbove(role)) {
      return Response.json({ error: "Only staff can update ticket status" }, { status: 403 });
    }

    const { solution, status: rawStatus } = await req.json();
    const status: ValidStatus = VALID_STATUSES.includes(rawStatus) ? rawStatus : "resolved";
    const { id } = await params;

    if (status === "resolved" && (!solution || solution.trim().length < 5)) {
      return Response.json(
        { error: "A solution description is required when resolving a ticket" },
        { status: 400 }
      );
    }

    // Check type-based access before delegating to service
    const existing = await prisma.ticket.findUnique({
      where: { id },
      select: { type: true, creatorId: true },
    });
    if (!existing) return Response.json({ error: "Ticket not found" }, { status: 404 });
    if (!canAccessTicket(role, userId, existing)) {
      return Response.json({ error: "You can only update tickets for your department" }, { status: 403 });
    }

    const ticket = await updateTicketStatus({
      ticketId: id,
      actorId: userId,
      actorName: session.user.name ?? "Staff",
      status,
      solution,
    });

    return Response.json(ticket);
  } catch (error) {
    console.error("Resolve ticket error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}
