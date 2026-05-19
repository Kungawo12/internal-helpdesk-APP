/**
 * Single source of truth for ticket access control.
 * Import this in every route that gates on "can this session user touch this ticket?"
 * instead of reimplementing the logic inline.
 */

/** Returns true when the session user is allowed to read/write the ticket. */
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
