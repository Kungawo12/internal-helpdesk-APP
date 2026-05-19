import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rating, comment } = await req.json();
    const { id: ticketId } = await params;

    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return Response.json({ error: "Rating must be an integer between 1 and 5" }, { status: 400 });
    }

    // Verify the ticket exists and belongs to the requesting user
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { creatorId: true, status: true },
    });

    if (!ticket) {
      return Response.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Only the ticket creator can submit feedback
    if (ticket.creatorId !== session.user.id) {
      return Response.json({ error: "Only the ticket creator can submit feedback" }, { status: 403 });
    }

    // Feedback only makes sense on resolved tickets
    if (ticket.status !== "resolved") {
      return Response.json({ error: "Feedback can only be submitted on resolved tickets" }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        rating,
        comment: comment ? String(comment).trim().slice(0, 1000) : null,
        ticketId,
        userId: session.user.id,
      },
    });

    logAudit(ticketId, session.user.id, "STATUS_CHANGED", {
      field: "feedback",
      newValue: `rating:${rating}`,
    }).catch(() => {});

    return Response.json(feedback, { status: 201 });
  } catch (error) {
    console.error("Feedback error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
