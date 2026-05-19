import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    if (!rating || rating < 1 || rating > 5) {
      return Response.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        rating,
        comment: comment || null,
        ticketId,
        userId: session.user.id,
      },
    });

    return Response.json(feedback, { status: 201 });
  } catch (error) {
    console.error("Feedback error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
