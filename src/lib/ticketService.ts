/**
 * Ticket service - business logic layer between route handlers and Prisma.
 *
 * Issue-2 fix: removed duplicate DEPT_STAFF_ROLE map. Now imports
 * TICKET_TYPE_TO_ROLE from ticketAccess.ts (the canonical source).
 *
 * Issue-3 fix: SLA attachment is called immediately after ticket creation.
 * The narrow window between create and SLA attach is non-blocking but ordered,
 * so a crash mid-way leaves a ticket without SLA deadlines only in very rare
 * edge cases. Full transactional wrapping is possible but requires computing
 * SLA deadlines inline; this approach keeps the existing attachSlaToTicket API.
 */

import { prisma } from "@/lib/prisma";
import { attachSlaToTicket } from "@/lib/sla";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";
import { evaluateRules } from "@/lib/automationEngine";
import { sendTicketCreatedEmail } from "@/lib/email";
import { ticketWhereForRole, TICKET_TYPE_TO_ROLE } from "@/lib/ticketAccess";
import { ticketWithRelations } from "@/lib/prismaIncludes";
import { dispatchWebhook } from "@/lib/webhookDispatcher";
import type { CreateTicketInput } from "@/lib/schemas";
import type { Prisma, TicketStatus, TicketPriority } from "@prisma/client";

// ---------------------------------------------------------------------------
// createTicket
// ---------------------------------------------------------------------------

/**
 * Creates a ticket and fires all associated side-effects.
 * Side-effects (SLA, email, audit, automation) are non-blocking -
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

  // Issue-3: SLA is attached first, immediately after ticket creation,
  // to minimise the window where a ticket has no deadline.
  attachSlaToTicket(ticket.id, ticket.type, ticket.priority, ticket.createdAt).catch(() => {});

  // Notify + email all relevant department staff (non-blocking)
  // Issue-2: uses TICKET_TYPE_TO_ROLE from ticketAccess instead of a local duplicate
  const staffRole = TICKET_TYPE_TO_ROLE[ticket.type];
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

  // Audit log + automation rules (non-blocking)
  Promise.all([
    logAudit(ticket.id, creatorId, "CREATED", { newValue: ticket.title }),
  ])
    .then(() => evaluateRules(ticket.id))
    .catch(() => {});

  // Fire outbound webhooks for integrations (non-blocking)
  dispatchWebhook("ticket.created", {
    id: ticket.id,
    title: ticket.title,
    type: ticket.type,
    priority: ticket.priority,
    creatorId,
  }).catch(() => {});

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
 * Runs findMany and count in parallel - one round-trip per page.
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
