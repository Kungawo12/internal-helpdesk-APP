import { prisma } from "@/lib/prisma";

// Exhaustive list of notification types — prevents typos and stale magic strings
export type NotificationType =
  | "NEW_TICKET"
  | "TICKET_ASSIGNED"
  | "TICKET_COMMENT"
  | "TICKET_ESCALATED"
  | "TICKET_RESOLVED"
  | "TICKET_REOPENED"
  | "TICKET_IN_PROGRESS";

export async function notify(
  userId: string,
  type: NotificationType,
  message: string,
  ticketId?: string
) {
  return prisma.notification.create({
    data: { userId, type, message, ticketId: ticketId ?? null },
  });
}
