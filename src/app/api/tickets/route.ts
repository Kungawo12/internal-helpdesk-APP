import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTicketCreatedEmail } from "@/lib/email";
import { notify } from "@/lib/notify";
import { logAudit } from "@/lib/audit";
import { attachSlaToTicket } from "@/lib/sla";
import { evaluateRules } from "@/lib/automationEngine";
import type { Prisma, TicketStatus, TicketPriority } from "@prisma/client";

const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 100;

/**
 * Role-based visibility filter — single source of truth.
 * Admin/manager see all tickets; staff see their department;
 * employees see only their own.
 */
function roleWhere(role: string, userId: string): Prisma.TicketWhereInput {
  if (role === "admin" || role === "manager") return {};
  if (role === "it_staff") return { type: "IT" };
  if (role === "hr_staff") return { type: "HR" };
  if (role === "ai_staff") return { type: "Software" };
  return { creatorId: userId };
}

// Valid enum values for safe param parsing
const VALID_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
const VALID_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, id } = session.user;
    const { searchParams } = new URL(req.url);

    // Validate enum params — reject arbitrary strings
    const rawStatus = searchParams.get("status");
    const status = rawStatus && (VALID_STATUSES as readonly string[]).includes(rawStatus)
      ? (rawStatus as TicketStatus)
      : undefined;

    const rawPriority = searchParams.get("priority");
    const priority = rawPriority && (VALID_PRIORITIES as readonly string[]).includes(rawPriority)
      ? (rawPriority as TicketPriority)
      : undefined;

    const type = searchParams.get("type") || undefined;

    // Cap search string — unbounded ILIKE %x% queries are expensive (M4)
    const rawQ = searchParams.get("q") || undefined;
    const q = rawQ ? rawQ.slice(0, 100) : undefined;

    // Pagination — default 20 rows, max 100
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      PAGE_SIZE_MAX,
      Math.max(1, parseInt(searchParams.get("pageSize") || String(PAGE_SIZE_DEFAULT), 10))
    );
    const skip = (page - 1) * pageSize;

    const paramFilter: Prisma.TicketWhereInput = {
      ...(status && { status }),
      ...(type && { type }),
      ...(priority && { priority }),
      ...(q && {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      }),
    };

    // One unified where object — replaces 5 near-identical findMany branches
    const where: Prisma.TicketWhereInput = { ...roleWhere(role, id), ...paramFilter };

    // Run count and data fetch in parallel — halves DB round-trips
    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          creator: { select: { name: true, email: true } },
          assignee: { select: { name: true, email: true } },
          feedback: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.ticket.count({ where }),
    ]);

    return Response.json({
      tickets,
      total,
      page,
      pageSize,
      hasMore: skip + tickets.length < total,
    });
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

    const ticketPriority = (VALID_PRIORITIES as readonly string[]).includes(priority)
      ? (priority as TicketPriority)
      : "medium" as TicketPriority;

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
