/**
 * Shared Prisma include/select objects.
 *
 * Why extract these?
 *  - The same `creator + assignee + feedback` block was copy-pasted across
 *    5+ route files. When a field needed adding (e.g. avatar URL) it had to
 *    be updated in every copy — a maintenance trap.
 *  - `as const` lets TypeScript infer the exact literal type so Prisma's
 *    result types are narrowed correctly at all call sites.
 */

/** Full ticket row with its most-needed relations — used by list and detail routes. */
export const ticketWithRelations = {
  creator: { select: { name: true, email: true } },
  assignee: { select: { name: true, email: true } },
  feedback: true,
} as const;

/** Creator only — used where the assignee is irrelevant (e.g. employee's own ticket). */
export const ticketWithCreator = {
  creator: { select: { name: true, email: true } },
  feedback: true,
} as const;

/** Comment with the author's public fields. */
export const commentWithAuthor = {
  user: { select: { name: true, email: true, role: true } },
} as const;

/** Attachment with uploader name. */
export const attachmentWithUploader = {
  uploadedBy: { select: { name: true } },
} as const;
