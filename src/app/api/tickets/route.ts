import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTicketCreatedEmail } from "@/lib/email";
import { notify } from "@/lib/notify";
import { logAudit } from "@/lib/audit";
import { attachSlaToTicket } from "@/lib/sla";
import { evaluateRules } from "@/lib/automationEngine";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, id } = session.user;
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status") || undefined;
    const type = searchParams.get("type") || undefined;
    const priority = searchParams.get("priority") || undefined;
    // M4: cap search string length — unbounded ILIKE %x% queries are expensive
    const rawQ = searchParams.get("q") || undefined;
    const q = rawQ ? rawQ.slice(0, 100) : undefined;

    // Build filter conditions from query params
    const paramFilter = {
      ...(status && { status }),
      ...(type && { type }),
      ...(priority && { priority }),
      ...(q && {
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
        ],
      }),
    };

    let tickets;

    if (role === "admin") {
      tickets = await prisma.ticket.findMany({
        where: paramFilter,
        include: { creator: { select: { name: true, email: true } }, assignee: { select: { name: true, email: true } }, feedback: true },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "it_staff") {
      tickets = await prisma.ticket.findMany({
        where: { type: "IT", ...paramFilter },
        include: { creator: { select: { name: true, email: true } }, assignee: { select: { name: true, email: true } }, feedback: true },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "ai_staff") {
      tickets = await prisma.ticket.findMany({
        where: { type: "Software", ...paramFilter },
        include: { creator: { select: { name: true, email: true } }, assignee: { select: { name: true, email: true } }, feedback: true },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "hr_staff") {
      tickets = await prisma.ticket.findMany({
        where: { type: "HR", ...paramFilter },
        include: { creator: { select: { name: true, email: true } }, assignee: { select: { name: true, email: true } }, feedback: true },
        orderBy: { createdAt: "desc" },
      });
    } else {
      tickets = await prisma.ticket.findMany({
        where: { creatorId: id, ...paramFilter },
        include: { assignee: { select: { name: true, email: true } }, feedback: true },
        orderBy: { createdAt: "desc" },
      });
    }

    return Response.json(tickets);
  } catch (error) {
    console.error("Fetch tickets error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to load tickets" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, type, priority, softwareName, errorMessage } = await req.json();

    if (!title || !description || !type) {
      return Response.json({ error: "Title, description, and type are required" }, { status: 400 });
    }

    if (!["IT", "HR", "Software"].includes(type)) {
      return Response.json({ error: "Type must be IT, HR, or Software" }, { status: 400 });
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
        ...((type === "Software") && {
          softwareName: softwareName?.trim() || null,
          errorMessage: errorMessage?.trim() || null,
        }),
      },
    });

    // Notify + email all relevant department staff (non-blocking)
    const staffRole = type === "HR" ? "hr_staff" : type === "Software" ? "ai_staff" : "it_staff";
    prisma.user
      .findMany({ where: { role: staffRole, active: true }, select: { id: true, email: true } })
      .then((staffMembers) => {
        for (const staff of staffMembers) {
          notify(staff.id, "NEW_TICKET", `New ${ticket.type} ticket: "${ticket.title}" (${ticket.priority} priority)`, ticket.id).catch(() => {});
          sendTicketCreatedEmail(
            staff.email,
            ticket.title,
            ticket.type,
            ticket.id,
            session.user.name ?? "Employee",
            ticket.priority
          ).catch(() => {});
        }
      })
      .catch(() => {});

    // Attach SLA, log creation, evaluate automation rules (all non-blocking)
    Promise.all([
      attachSlaToTicket(ticket.id, ticket.type, ticket.priority, ticket.createdAt),
      logAudit(ticket.id, session.user.id, "CREATED", { newValue: ticket.title }),
    ]).catch(() => {});
    evaluateRules(ticket.id).catch(() => {});

    return Response.json(ticket, { status: 201 });
  } catch (error) {
    console.error("Create ticket error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to create ticket. Please try again." }, { status: 500 });
  }
}
