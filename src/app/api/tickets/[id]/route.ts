import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// H-3: explicit allow-list with default deny — unknown roles cannot fall through

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

    // Explicit allow-list — default deny for any unrecognised role
    if (role === "admin" || role === "manager") {
      // Full access
    } else if (role === "employee") {
      if (ticket.creatorId !== userId) {
        return Response.json({ error: "Access denied" }, { status: 403 });
      }
    } else if (role === "it_staff") {
      if (ticket.type !== "IT") {
        return Response.json({ error: "Access denied" }, { status: 403 });
      }
    } else if (role === "hr_staff") {
      if (ticket.type !== "HR") {
        return Response.json({ error: "Access denied" }, { status: 403 });
      }
    } else if (role === "ai_staff") {
      if (ticket.type !== "Software") {
        return Response.json({ error: "Access denied" }, { status: 403 });
      }
    } else {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    return Response.json(ticket);
  } catch (error) {
    console.error("Fetch ticket error:", error);
    return Response.json({ error: "Failed to load ticket" }, { status: 500 });
  }
}
