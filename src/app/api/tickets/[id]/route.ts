import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessTicket } from "@/lib/ticketAccess";

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

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        creator: { select: { name: true, email: true } },
        assignee: { select: { name: true, email: true } },
        feedback: true,
      },
    });

    if (!ticket) {
      return Response.json({ error: "Ticket not found" }, { status: 404 });
    }

    const { role, id: userId } = session.user;

    if (!canAccessTicket(role, userId, ticket)) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    return Response.json(ticket);
  } catch (error) {
    console.error("Fetch ticket error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to load ticket" }, { status: 500 });
  }
}
