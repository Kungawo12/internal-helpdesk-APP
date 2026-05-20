/**
 * Ticket service — business logic layer between route handlers and Prisma.
 *
 * Why a service layer?
 *  Before: every route handler mixed HTTP parsing, auth checks, Prisma calls,
 *  SLA attachment, audit logging, email, and automation in one function.
 *  Testing required mocking the entire HTTP stack.
 *
 *  After: route handlers own HTTP concerns only (parse → validate → call service
 *  → return response). This file owns what "creating a ticket" means as a
 *  business operation — it can be called from a route, a cron job, a test,
 *  or a future admin action without touching HTTP at all.
 *
 * Imports:
 *  - No `next/server` or `getServerSession` — services are HTTP-agnostic.
 *  - Auth checks happen in the route handler before calling the service.
 */

import { prisma } from "@/lib/prisma";
import { attachSlaToTicket } from "@/lib/sla";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";
import { evaluateRules } from "@/lib/automationEngine";
import { sendTicketCreatedEmail } from "@/lib/email";
import { ticketWhereForRole } from "@/lib/ticketAccess";
import { ticketWithRelations } from "@/lib/prismaIncludes";
import type { CreateTicketInput } from "@/lib/schemas";
import type { Prisma, TicketStatus, TicketPriority } from "@prisma/client";

/** Maps ticket type to the staff role responsible for it. */
const DEPT_STAFF_ROLE: Record<string, string> = {
  IT: "it_staff",
  HR: "hr_staff",
  Software: "ai_staff",
};

// ---------------------------------------------------------------------------
// createTicket
// ---------------------------------------------------------------------------

/**
 * Creates a ticket and fires all associated side-effects.
 * Side-effects (SLA, email, audit, automation) are non-blocking —
 * a failure in one does not abort the ticket creation response.
 */
export async function createTicket(
  data: CreateTicketInput,
  creatorId: string,
  creatorName: string
) {
  const ticket = await prisma.ticket.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      creatorId,
      ...(data.type === "Software" && {
        softwareName: data.softwareName ?? null,
        errorMessage: data.errorMessage ?? null,
      }),
    },
  });

  // Notify + email all relevant department staff (non-blocking)
  const staffRole = DEPT_STAFF_ROLE[data.type];
  if (staffRole) {
    prisma.user
      .findMany({ where: { role: staffRole, active: true }, select: { id: true, email: true } })
      .then((staffMembers) => {
        for (const staff of staffMembers) {
          notify(
            staff.id,
            "NEW_TICKET",
            `New ${ticket.type} ticket: "${ticket.title}" (${ticket.priority} priority)`,
            ticket.id
          ).catch(() => {});
          sendTicketCreatedEmail(
            staff.email,
            ticket.title,
            ticket.type,
            ticket.id,
            creatorName,
            ticket.priority
          ).catch(() => {});
        }
      })
      .catch(() => {});
  }

  // SLA attachment + audit log run in parallel, then automation rules
  Promise.all([
    attachSlaToTicket(ticket.id, ticket.type, ticket.priority, ticket.createdAt),
    logAudit(ticket.id, creatorId, "CREATED", { newValue: ticket.title }),
  ]).catch(() => {});
  evaluateRules(ticket.id).catch(() => {});

  return ticket;
}

// ---------------------------------------------------------------------------
// listTickets
// ---------------------------------------------------------------------------

export interface ListTicketsQuery {
  role: string;
  userId: string;
  status?: TicketStatus;
  type?: string;
  priority?: TicketPriority;
  q?: string;
  page: number;
  pageSize: number;
}

/**
 * Returns a paginated, role-filtered ticket list.
 * Runs findMany and count in parallel — one round-trip per page.
 */
export async function listTickets({
  role,
  userId,
  status,
  type,
  priority,
  q,
  page,
  pageSize,
}: ListTicketsQuery) {
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

  const where: Prisma.TicketWhereInput = {
    ...ticketWhereForRole(role, userId),
    ...paramFilter,
  };

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: ticketWithRelations,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    tickets,
    total,
    page,
    pageSize,
    hasMore: skip + tickets.length < total,
  };
}
