/**
 * Ticket service - business logic layer between route handlers and Prisma.
 *
 * FIX L1 (Logging): All side-effect .catch(() => {}) blocks have been replaced
 * with .catch((err) => console.error(...)) so failures are surfaced in logs.
 * Previously, a silent SLA attachment failure meant a ticket could exist with no
 * deadline and no alert. Now every background failure leaves an observable trace.
 *
 * Issue-2 fix: removed duplicate DEPT_STAFF_ROLE map. Now imports
 * TICKET_TYPE_TO_ROLE from ticketAccess.ts (the canonical source).
 *
 * Issue-3 fix: SLA attachment is called immediately after ticket creation.
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
 *
 * Side-effects are intentionally non-blocking (fire-and-forget) so a slow
 * email relay or SLA table doesn't delay the HTTP response to the user.
 * However, they now log failures instead of swallowing them silently (FIX L1).
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

  // FIX L1: attach SLA first; log failure instead of silently swallowing it
  attachSlaToTicket(ticket.id, ticket.type, ticket.priority, ticket.createdAt).catch((err) =>
        console.error(`[SLA] Failed to attach SLA to ticket ${ticket.id}:`, err instanceof Error ? err.message : err)
                                                                                       );

  // Notify + email all relevant department staff (non-blocking)
  const staffRole = TICKET_TYPE_TO_ROLE[ticket.type];

  if (staffRole) {
        prisma.user
          .findMany({ where: { role: staffRole, active: true }, select: { id: true, email: true } })
          .then((staffList) => {
                    for (const staff of staffList) {
                                // FIX L1: log notification failures
                      notify(staff.id, `New ${ticket.type} ticket: ${ticket.title}`, `/dashboard/ticket/${ticket.id}`).catch(
                                    (err) => console.error(`[NOTIFY] Failed to notify user ${staff.id}:`, err instanceof Error ? err.message : err)
                                  );
                                sendTicketCreatedEmail(
                                              staff.email,
                                              ticket.title,
                                              ticket.type,
                                              ticket.id,
                                              creatorName,
                                              ticket.priority
                                            ).catch((err) =>
                                              console.error(`[EMAIL] Failed to send creation email to ${staff.email}:`, err instanceof Error ? err.message : err)
                                                              );
                    }
          })
          .catch((err) =>
                    console.error(`[STAFF_LOOKUP] Failed to load staff for ticket ${ticket.id}:`, err instanceof Error ? err.message : err)
                       );
  }

  // Audit log — FIX L1: log failures
  logAudit(ticket.id, creatorId, "CREATED", { title: ticket.title, type: ticket.type, priority: ticket.priority }).catch(
        (err) => console.error(`[AUDIT] Failed to log CREATED for ticket ${ticket.id}:`, err instanceof Error ? err.message : err)
      );

  // Automation rules — FIX L1: log failures
  evaluateRules(ticket.id).catch((err) =>
        console.error(`[AUTOMATION] Failed to evaluate rules for ticket ${ticket.id}:`, err instanceof Error ? err.message : err)
                                   );

  // Webhook dispatch — FIX L1: log failures
  dispatchWebhook("ticket.created", {
        id: ticket.id,
        title: ticket.title,
        type: ticket.type,
        priority: ticket.priority,
        creatorId,
  }).catch((err) =>
        console.error(`[WEBHOOK] Failed to dispatch ticket.created for ${ticket.id}:`, err instanceof Error ? err.message : err)
             );

  return ticket;
}

// ---------------------------------------------------------------------------
// listTickets
// ---------------------------------------------------------------------------

interface ListTicketsParams {
    role: string;
    userId: string;
    status?: TicketStatus;
    type?: string;
    priority?: TicketPriority;
    q?: string;
    page?: number;
    pageSize?: number;
}

export async function listTickets({
    role,
    userId,
    status,
    type,
    priority,
    q,
    page = 1,
    pageSize = 20,
}: ListTicketsParams) {
    const where: Prisma.TicketWhereInput = {
          ...ticketWhereForRole(role, userId),
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

  const [tickets, total] = await Promise.all([
        prisma.ticket.findMany({
                where,
                include: ticketWithRelations,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
        }),
        prisma.ticket.count({ where }),
      ]);

  return { tickets, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
