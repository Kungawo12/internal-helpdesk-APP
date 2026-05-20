/**
 * Zod schemas for API input validation.
 *
 * Why Zod instead of hand-rolled checks?
 *  - One place to change a rule (e.g. min password length) instead of hunting
 *    through every route file.
 *  - Consistent error messages and unknown-field stripping (.strict() / .strip()).
 *  - schema.parse() throws ZodError with a structured issues array — callers
 *    can format it however they like without duplicating logic.
 *  - Schemas double as TypeScript types via z.infer<typeof Schema>.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address");

export const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters");

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------

export const RegisterSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: emailSchema,
  password: passwordSchema,
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const ForgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

// ---------------------------------------------------------------------------
// Ticket schemas
// ---------------------------------------------------------------------------

const TICKET_TYPES = ["IT", "HR", "Software"] as const;
const TICKET_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export const CreateTicketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters"),
  type: z.enum(TICKET_TYPES, { message: "Type must be IT, HR, or Software" }),
  priority: z.enum(TICKET_PRIORITIES).optional().default("medium"),
  softwareName: z.string().trim().max(200).optional(),
  errorMessage: z.string().trim().max(1000).optional(),
});
export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;

export const TicketFeedbackSchema = z.object({
  rating: z
    .number({ message: "Rating must be a number" })
    .int()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  comment: z.string().trim().max(1000).optional(),
});
export type TicketFeedbackInput = z.infer<typeof TicketFeedbackSchema>;

// ---------------------------------------------------------------------------
// KB article schema
// ---------------------------------------------------------------------------

const KB_TYPES = ["IT", "HR", "general"] as const;

export const CreateKbArticleSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Content is required"),
  type: z.enum(KB_TYPES, { message: "type must be IT, HR, or general" }),
  tags: z.string().optional(),
  published: z.boolean().optional().default(true),
});
export type CreateKbArticleInput = z.infer<typeof CreateKbArticleSchema>;

// ---------------------------------------------------------------------------
// Helper — turns a ZodError into the first human-readable message
// ---------------------------------------------------------------------------

export function firstZodError(err: z.ZodError): string {
  return err.issues[0]?.message ?? "Invalid input";
}
