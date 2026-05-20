/**
 * Unit tests for src/lib/ticketAccess.ts
 *
 * These are pure-function tests — no database, no network.
 * They run in milliseconds and prove the access-control rules are correct
 * without needing a running server.
 *
 * Why test this in particular?
 *  canAccessTicket is the single source of truth for every ticket route's
 *  authorization check. A silent regression here would be a security issue,
 *  not just a bug. Tests make that regression visible immediately.
 */

import { describe, it, expect } from "vitest";
import { canAccessTicket, isStaffOrAbove, ticketWhereForRole } from "@/lib/ticketAccess";

const ticket = { creatorId: "user-1", type: "IT" };

describe("canAccessTicket", () => {
  it("admin can access any ticket", () => {
    expect(canAccessTicket("admin", "other-user", ticket)).toBe(true);
  });

  it("manager can access any ticket", () => {
    expect(canAccessTicket("manager", "other-user", ticket)).toBe(true);
  });

  it("it_staff can access IT tickets", () => {
    expect(canAccessTicket("it_staff", "someone", { ...ticket, type: "IT" })).toBe(true);
  });

  it("it_staff cannot access HR tickets", () => {
    expect(canAccessTicket("it_staff", "someone", { ...ticket, type: "HR" })).toBe(false);
  });

  it("hr_staff can access HR tickets", () => {
    expect(canAccessTicket("hr_staff", "someone", { ...ticket, type: "HR" })).toBe(true);
  });

  it("hr_staff cannot access IT tickets", () => {
    expect(canAccessTicket("hr_staff", "someone", { ...ticket, type: "IT" })).toBe(false);
  });

  it("ai_staff can access Software tickets", () => {
    expect(canAccessTicket("ai_staff", "someone", { ...ticket, type: "Software" })).toBe(true);
  });

  it("ai_staff cannot access IT tickets", () => {
    expect(canAccessTicket("ai_staff", "someone", { ...ticket, type: "IT" })).toBe(false);
  });

  it("employee can access their own ticket", () => {
    expect(canAccessTicket("employee", "user-1", ticket)).toBe(true);
  });

  it("employee cannot access another user's ticket", () => {
    expect(canAccessTicket("employee", "user-2", ticket)).toBe(false);
  });

  it("unknown role is denied", () => {
    expect(canAccessTicket("guest", "user-1", ticket)).toBe(false);
  });
});

describe("ticketWhereForRole", () => {
  it("admin gets an empty where clause (sees all)", () => {
    expect(ticketWhereForRole("admin", "u1")).toEqual({});
  });

  it("manager gets an empty where clause (sees all)", () => {
    expect(ticketWhereForRole("manager", "u1")).toEqual({});
  });

  it("it_staff is restricted to IT tickets", () => {
    expect(ticketWhereForRole("it_staff", "u1")).toEqual({ type: "IT" });
  });

  it("hr_staff is restricted to HR tickets", () => {
    expect(ticketWhereForRole("hr_staff", "u1")).toEqual({ type: "HR" });
  });

  it("ai_staff is restricted to Software tickets", () => {
    expect(ticketWhereForRole("ai_staff", "u1")).toEqual({ type: "Software" });
  });

  it("employee is restricted to their own tickets", () => {
    expect(ticketWhereForRole("employee", "user-42")).toEqual({ creatorId: "user-42" });
  });

  it("unknown role is restricted to their own tickets (safe default)", () => {
    expect(ticketWhereForRole("guest", "user-42")).toEqual({ creatorId: "user-42" });
  });
});

describe("isStaffOrAbove", () => {
  it.each(["it_staff", "hr_staff", "ai_staff", "admin", "manager"])(
    "%s is staff or above",
    (role) => {
      expect(isStaffOrAbove(role)).toBe(true);
    }
  );

  it.each(["employee", "guest", ""])(
    "%s is NOT staff or above",
    (role) => {
      expect(isStaffOrAbove(role)).toBe(false);
    }
  );
});
