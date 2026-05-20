/**
 * Unit tests for src/lib/schemas.ts (Zod validation schemas)
 *
 * These verify that valid inputs pass and invalid inputs fail with the
 * correct human-readable messages — catching regressions when rules change
 * (e.g. someone lowers the minimum password length).
 */

import { describe, it, expect } from "vitest";
import {
  RegisterSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  CreateTicketSchema,
  TicketFeedbackSchema,
  firstZodError,
} from "@/lib/schemas";

// ---------------------------------------------------------------------------
// RegisterSchema
// ---------------------------------------------------------------------------

describe("RegisterSchema", () => {
  const valid = { name: "Alice", email: "alice@example.com", password: "supersecure1" };

  it("accepts valid input", () => {
    expect(RegisterSchema.safeParse(valid).success).toBe(true);
  });

  it("lowercases and trims email", () => {
    const result = RegisterSchema.safeParse({ ...valid, email: "  Alice@Example.COM  " });
    expect(result.success && result.data.email).toBe("alice@example.com");
  });

  it("rejects name shorter than 2 chars", () => {
    const result = RegisterSchema.safeParse({ ...valid, name: "A" });
    expect(result.success).toBe(false);
    expect(!result.success && firstZodError(result.error)).toMatch(/2 characters/);
  });

  it("rejects invalid email", () => {
    const result = RegisterSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 10 chars", () => {
    const result = RegisterSchema.safeParse({ ...valid, password: "short" });
    expect(result.success).toBe(false);
    expect(!result.success && firstZodError(result.error)).toMatch(/10 characters/);
  });
});

// ---------------------------------------------------------------------------
// ForgotPasswordSchema
// ---------------------------------------------------------------------------

describe("ForgotPasswordSchema", () => {
  it("accepts a valid email", () => {
    expect(ForgotPasswordSchema.safeParse({ email: "user@example.com" }).success).toBe(true);
  });

  it("rejects a missing email", () => {
    expect(ForgotPasswordSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ResetPasswordSchema
// ---------------------------------------------------------------------------

describe("ResetPasswordSchema", () => {
  const valid = { token: "abc123", password: "newpassword1" };

  it("accepts valid input", () => {
    expect(ResetPasswordSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty token", () => {
    expect(ResetPasswordSchema.safeParse({ ...valid, token: "" }).success).toBe(false);
  });

  it("rejects short password", () => {
    expect(ResetPasswordSchema.safeParse({ ...valid, password: "short" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// CreateTicketSchema
// ---------------------------------------------------------------------------

describe("CreateTicketSchema", () => {
  const valid = { title: "VPN not working", description: "Cannot connect to VPN since yesterday.", type: "IT" };

  it("accepts valid IT ticket", () => {
    expect(CreateTicketSchema.safeParse(valid).success).toBe(true);
  });

  it("defaults priority to medium when omitted", () => {
    const result = CreateTicketSchema.safeParse(valid);
    expect(result.success && result.data.priority).toBe("medium");
  });

  it("accepts explicit priority", () => {
    const result = CreateTicketSchema.safeParse({ ...valid, priority: "urgent" });
    expect(result.success && result.data.priority).toBe("urgent");
  });

  it("rejects title shorter than 3 chars", () => {
    const result = CreateTicketSchema.safeParse({ ...valid, title: "Hi" });
    expect(result.success).toBe(false);
    expect(!result.success && firstZodError(result.error)).toMatch(/3 characters/);
  });

  it("rejects title longer than 200 chars", () => {
    const result = CreateTicketSchema.safeParse({ ...valid, title: "a".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("rejects description shorter than 10 chars", () => {
    const result = CreateTicketSchema.safeParse({ ...valid, description: "Too short" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid ticket type", () => {
    const result = CreateTicketSchema.safeParse({ ...valid, type: "Finance" });
    expect(result.success).toBe(false);
    expect(!result.success && firstZodError(result.error)).toMatch(/IT, HR, or Software/);
  });

  it("rejects invalid priority", () => {
    const result = CreateTicketSchema.safeParse({ ...valid, priority: "critical" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// TicketFeedbackSchema
// ---------------------------------------------------------------------------

describe("TicketFeedbackSchema", () => {
  it("accepts rating 1–5", () => {
    for (const rating of [1, 2, 3, 4, 5]) {
      expect(TicketFeedbackSchema.safeParse({ rating }).success).toBe(true);
    }
  });

  it("rejects rating 0 and 6", () => {
    expect(TicketFeedbackSchema.safeParse({ rating: 0 }).success).toBe(false);
    expect(TicketFeedbackSchema.safeParse({ rating: 6 }).success).toBe(false);
  });

  it("rejects non-integer rating", () => {
    expect(TicketFeedbackSchema.safeParse({ rating: 3.5 }).success).toBe(false);
  });

  it("accepts optional comment", () => {
    const result = TicketFeedbackSchema.safeParse({ rating: 5, comment: "Great support!" });
    expect(result.success).toBe(true);
  });

  it("rejects comment over 1000 chars", () => {
    const result = TicketFeedbackSchema.safeParse({ rating: 4, comment: "x".repeat(1001) });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// firstZodError helper
// ---------------------------------------------------------------------------

describe("firstZodError", () => {
  it("returns the first issue message", () => {
    const result = RegisterSchema.safeParse({ name: "A", email: "bad", password: "short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = firstZodError(result.error);
      expect(typeof msg).toBe("string");
      expect(msg.length).toBeGreaterThan(0);
    }
  });
});
