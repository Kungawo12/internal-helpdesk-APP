import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role, id } = session.user;

  let tickets;

  if (role === "manager") {
    // Managers see all tickets
    tickets = await prisma.ticket.findMany({
      include: { creator: { select: { name: true, email: true } }, assignee: { select: { name: true, email: true } }, feedback: true },
      orderBy: { createdAt: "desc" },
    });
  } else if (role === "it_staff") {
    // IT staff sees IT tickets
    tickets = await prisma.ticket.findMany({
      where: { type: "IT" },
      include: { creator: { select: { name: true, email: true } }, assignee: { select: { name: true, email: true } }, feedback: true },
      orderBy: { createdAt: "desc" },
    });
  } else if (role === "hr_staff") {
    // HR staff sees HR tickets
    tickets = await prisma.ticket.findMany({
      where: { type: "HR" },
      include: { creator: { select: { name: true, email: true } }, assignee: { select: { name: true, email: true } }, feedback: true },
      orderBy: { createdAt: "desc" },
    });
  } else {
    // Employees see only their own tickets
    tickets = await prisma.ticket.findMany({
      where: { creatorId: id },
      include: { assignee: { select: { name: true, email: true } }, feedback: true },
      orderBy: { createdAt: "desc" },
    });
  }

  return Response.json(tickets);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, type, priority } = await req.json();

  if (!title || !description || !type) {
    return Response.json({ error: "Title, description, and type are required" }, { status: 400 });
  }

  const ticket = await prisma.ticket.create({
    data: {
      title,
      description,
      type,
      priority: priority || "medium",
      creatorId: session.user.id,
    },
  });

  return Response.json(ticket, { status: 201 });
}
