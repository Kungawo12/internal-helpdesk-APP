import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreateTicketSchema, firstZodError } from "@/lib/schemas";
import { createTicket, listTickets } from "@/lib/ticketService";
import type { TicketStatus, TicketPriority } from "@prisma/client";

const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 100;

// Valid enum values for safe query-param parsing
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

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      PAGE_SIZE_MAX,
      Math.max(1, parseInt(searchParams.get("pageSize") || String(PAGE_SIZE_DEFAULT), 10))
    );

    const result = await listTickets({ role, userId: id, status, type, priority, q, page, pageSize });
    return Response.json(result);
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

    const parsed = CreateTicketSchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
    }

    const ticket = await createTicket(
      parsed.data,
      session.user.id,
      session.user.name ?? "Employee"
    );

    return Response.json(ticket, { status: 201 });
  } catch (error) {
    console.error("Create ticket error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to create ticket. Please try again." }, { status: 500 });
  }
}
