/**
 * Unit tests for src/lib/sla.ts (attachSlaToTicket)
 *
 * We mock Prisma so no database is needed. Tests verify:
 * 1. Deadlines are computed correctly from default SLA tables.
 * 2. Custom SlaPolicy rows override the defaults.
 * 3. Unknown type/priority combinations exit gracefully without updating.
 *
 * Why test SLA logic?
 * SLA deadlines drive breach notifications and manager dashboards.
 * A mis-calculation (wrong multiplier, wrong ticket type) would silently
 * corrupt all deadline data going forward.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    slaPolicy: {
      findFirst: vi.fn(),
    },
    ticket: {
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { attachSlaToTicket } from "@/lib/sla";

const mockPrisma = prisma as {
  slaPolicy: { findFirst: ReturnType<typeof vi.fn> };
  ticket: { update: ReturnType<typeof vi.fn> };
};

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.slaPolicy.findFirst.mockResolvedValue(null); // default: no custom policy
  mockPrisma.ticket.update.mockResolvedValue({});
});

const BASE_DATE = new Date("2026-01-01T00:00:00Z");

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

describe("attachSlaToTicket -- default SLA deadlines", () => {
  it("sets correct deadlines for IT urgent ticket", async () => {
    await attachSlaToTicket("ticket-1", "IT", "urgent", BASE_DATE);

    expect(mockPrisma.ticket.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "ticket-1" },
        data: expect.objectContaining({
          slaFirstResponseDue: addMinutes(BASE_DATE, 60),   // 1h
          slaResolutionDue: addMinutes(BASE_DATE, 240),     // 4h
        }),
      })
    );
  });

  it("sets correct deadlines for IT medium ticket", async () => {
    await attachSlaToTicket("ticket-2", "IT", "medium", BASE_DATE);

    expect(mockPrisma.ticket.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slaFirstResponseDue: addMinutes(BASE_DATE, 480),  // 8h
          slaResolutionDue: addMinutes(BASE_DATE, 1440),    // 24h
        }),
      })
    );
  });

  it("sets correct deadlines for HR high ticket", async () => {
    await attachSlaToTicket("ticket-3", "HR", "high", BASE_DATE);

    expect(mockPrisma.ticket.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slaFirstResponseDue: addMinutes(BASE_DATE, 480),  // 8h
          slaResolutionDue: addMinutes(BASE_DATE, 2880),    // 48h
        }),
      })
    );
  });

  it("does NOT update the ticket for unknown type", async () => {
    await attachSlaToTicket("ticket-4", "UNKNOWN", "medium", BASE_DATE);
    expect(mockPrisma.ticket.update).not.toHaveBeenCalled();
  });

  it("does NOT update the ticket for unknown priority", async () => {
    await attachSlaToTicket("ticket-5", "IT", "UNKNOWN", BASE_DATE);
    expect(mockPrisma.ticket.update).not.toHaveBeenCalled();
  });
});

describe("attachSlaToTicket -- custom SLA policy overrides defaults", () => {
  it("uses custom firstResponseMinutes and resolutionMinutes when a policy exists", async () => {
    mockPrisma.slaPolicy.findFirst.mockResolvedValue({
      id: "policy-1",
      firstResponseMinutes: 30,
      resolutionMinutes: 120,
    });

    await attachSlaToTicket("ticket-6", "IT", "urgent", BASE_DATE);

    expect(mockPrisma.ticket.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slaPolicyId: "policy-1",
          slaFirstResponseDue: addMinutes(BASE_DATE, 30),
          slaResolutionDue: addMinutes(BASE_DATE, 120),
        }),
      })
    );
  });

  it("queries the policy with correct type and priority", async () => {
    mockPrisma.slaPolicy.findFirst.mockResolvedValue(null);
    await attachSlaToTicket("ticket-7", "HR", "low", BASE_DATE);

    expect(mockPrisma.slaPolicy.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ticketType: "HR", priority: "low" },
      })
    );
  });
});
