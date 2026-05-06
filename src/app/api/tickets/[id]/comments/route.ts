import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const comments = await prisma.comment.findMany({
      where: { ticketId: id },
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return Response.json(comments);
  } catch (error) {
    console.error("Fetch comments error:", error);
    return Response.json({ error: "Failed to load comments" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: ticketId } = await params;
    const { content } = await req.json();

    if (!content || content.trim().length < 2) {
      return Response.json({ error: "Comment must be at least 2 characters" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        ticketId,
        userId: session.user.id,
      },
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
    });

    return Response.json(comment, { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error);
    return Response.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
