import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTicketCreatedEmail } from "@/lib/email";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, id } = session.user;

    let tickets;

    if (role === "manager") {
      tickets = await prisma.ticket.findMany({
        include: { creator: { select: { name: true, email: true } }, assignee: { select: { name: true, email: true } }, feedback: true },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "it_staff") {
      tickets = await prisma.ticket.findMany({
        where: { type: "IT" },
        include: { creator: { select: { name: true, email: true } }, assignee: { select: { name: true, email: true } }, feedback: true },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "hr_staff") {
      tickets = await prisma.ticket.findMany({
        where: { type: "HR" },
        include: { creator: { select: { name: true, email: true } }, assignee: { select: { name: true, email: true } }, feedback: true },
        orderBy: { createdAt: "desc" },
      });
    } else {
      tickets = await prisma.ticket.findMany({
        where: { creatorId: id },
        include: { assignee: { select: { name: true, email: true } }, feedback: true },
        orderBy: { createdAt: "desc" },
      });
    }

    return Response.json(tickets);
  } catch (error) {
    console.error("Fetch tickets error:", error);
    return Response.json({ error: "Failed to load tickets" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, type, priority } = await req.json();

    if (!title || !description || !type) {
      return Response.json({ error: "Title, description, and type are required" }, { status: 400 });
    }

    if (!["IT", "HR"].includes(type)) {
      return Response.json({ error: "Type must be IT or HR" }, { status: 400 });
    }

    if (title.length < 3 || title.length > 200) {
      return Response.json({ error: "Title must be between 3 and 200 characters" }, { status: 400 });
    }

    if (description.length < 10) {
      return Response.json({ error: "Description must be at least 10 characters" }, { status: 400 });
    }

    const validPriorities = ["low", "medium", "high", "urgent"];
    const ticketPriority = validPriorities.includes(priority) ? priority : "medium";

    const ticket = await prisma.ticket.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        type,
        priority: ticketPriority,
        creatorId: session.user.id,
      },
    });

    // Send email notification to relevant staff (non-blocking)
    const staffRole = type === "IT" ? "it_staff" : "hr_staff";
    prisma.user
      .findMany({ where: { role: staffRole }, select: { email: true } })
      .then((staffMembers) => {
        for (const staff of staffMembers) {
          sendTicketCreatedEmail(
            staff.email,
            ticket.title,
            ticket.type,
            session.user.name
          ).catch(() => {});
        }
      })
      .catch(() => {});

    return Response.json(ticket, { status: 201 });
  } catch (error) {
    console.error("Create ticket error:", error);
    return Response.json({ error: "Failed to create ticket. Please try again." }, { status: 500 });
  }
}
