/**
 * Single source of truth for ticket authorization.
 *
 * Three concerns live here so they can never drift out of sync:
 *  1. canAccessTicket  — can this (role, userId) touch this ticket?
 *  2. isStaffOrAbove   — does this role have staff-level privileges?
 *  3. ticketWhereForRole — Prisma WhereInput that enforces visibility at the DB layer
 *
 * The middleware enforces route-level access (which /dashboard/* path a role can visit).
 * This file enforces data-level access (which rows a role can read/write).
 * They must stay consistent — both are driven off the same role strings.
 */

import type { Prisma } from "@prisma/client";

/** Returns true when the session user is allowed to read/write the given ticket. */
export function canAccessTicket(
  role: string,
  userId: string,
  ticket: { creatorId: string; type: string }
): boolean {
  if (role === "admin" || role === "manager") return true;
  if (role === "employee") return ticket.creatorId === userId;
  if (role === "it_staff") return ticket.type === "IT";
  if (role === "hr_staff") return ticket.type === "HR";
  if (role === "ai_staff") return ticket.type === "Software";
  return false; // default deny — unknown roles get nothing
}

/** Returns true for roles that can read internal notes and perform staff actions. */
export function isStaffOrAbove(role: string): boolean {
  return ["it_staff", "hr_staff", "ai_staff", "admin", "manager"].includes(role);
}

/**
 * Returns the Prisma WhereInput that restricts a query to only the rows
 * a given role is allowed to see. Used in list endpoints so the DB does
 * the filtering instead of loading all rows and filtering in memory.
 *
 * Mirrors canAccessTicket exactly — if you change one, change the other.
 */
export function ticketWhereForRole(
  role: string,
  userId: string
): Prisma.TicketWhereInput {
  if (role === "admin" || role === "manager") return {};
  if (role === "it_staff") return { type: "IT" };
  if (role === "hr_staff") return { type: "HR" };
  if (role === "ai_staff") return { type: "Software" };
  return { creatorId: userId }; // employee — own tickets only
}
