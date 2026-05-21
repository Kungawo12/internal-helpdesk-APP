/**
 * Unit tests for src/lib/ticketService.ts
 *
 * We mock Prisma so these tests run without a database.
 * Side-effect functions (sla, email, audit, automation, webhook) are also
 * mocked so we can assert they are called without their real implementations.
 *
 * Why test ticketService?
 * createTicket orchestrates 6+ side-effects. A silent regression (e.g.
 * SLA not attached, wrong staff notified) would be hard to catch without tests.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock all external dependencies before importing the module under test ---

vi.mock("@/lib/prisma", () => ({
  prisma: {
    ticket: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/sla", () => ({ attachSlaToTicket: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/audit", () => ({ logAudit: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/notify", () => ({ notify: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/automationEngine", () => ({ evaluateRules: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/email", () => ({
  sendTicketCreatedEmail: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/webhookDispatcher", () => ({
  dispatchWebhook: vi.fn().mockResolvedValue(undefined),
}));

import { prisma } from "@/lib/prisma";
import { attachSlaToTicket } from "@/lib/sla";
import { createTicket, listTickets } from "@/lib/ticketService";
import type { CreateTicketInput } from "@/lib/schemas";

const mockPrisma = prisma as {
  ticket: {
    create: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };
  user: { findMany: ReturnType<typeof vi.fn> };
};

const baseInput: CreateTicketInput = {
  title: "Test ticket",
  description: "Description of the issue",
  type: "IT",
  priority: "medium",
};

const mockTicket = {
  id: "ticket-1",
  title: baseInput.title,
  description: baseInput.description,
  type: baseInput.type,
  priority: baseInput.priority,
  status: "open",
  creatorId: "user-1",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  assigneeId: null,
  slaBreached: false,
  softwareName: null,
  errorMessage: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.ticket.create.mockResolvedValue(mockTicket);
  mockPrisma.user.findMany.mockResolvedValue([]);
  mockPrisma.ticket.findMany.mockResolvedValue([]);
  mockPrisma.ticket.count.mockResolvedValue(0);
});

describe("createTicket", () => {
  it("creates a ticket with the provided data", async () => {
    await createTicket(baseInput, "user-1", "Test User");
    expect(mockPrisma.ticket.create).toHaveBeenCalledOnce();
    const createArg = mockPrisma.ticket.create.mock.calls[0][0];
    expect(createArg.data.title).toBe(baseInput.title);
    expect(createArg.data.type).toBe("IT");
    expect(createArg.data.creatorId).toBe("user-1");
  });

  it("attaches SLA immediately after ticket creation", async () => {
    await createTicket(baseInput, "user-1", "Test User");
    // Give non-blocking side-effects a tick to fire
    await new Promise((r) => setTimeout(r, 0));
    expect(attachSlaToTicket).toHaveBeenCalledWith(
      mockTicket.id,
      mockTicket.type,
      mockTicket.priority,
      mockTicket.createdAt
    );
  });

  it("sets softwareName and errorMessage for Software tickets", async () => {
    const softwareInput: CreateTicketInput = {
      ...baseInput,
      type: "Software",
      softwareName: "MyApp",
      errorMessage: "NullPointerException",
    };
    const softwareMockTicket = { ...mockTicket, type: "Software", softwareName: "MyApp", errorMessage: "NullPointerException" };
    mockPrisma.ticket.create.mockResolvedValue(softwareMockTicket);

    await createTicket(softwareInput, "user-1", "Test User");

    const createArg = mockPrisma.ticket.create.mock.calls[0][0];
    expect(createArg.data.softwareName).toBe("MyApp");
    expect(createArg.data.errorMessage).toBe("NullPointerException");
  });

  it("does not include softwareName for non-Software tickets", async () => {
    await createTicket(baseInput, "user-1", "Test User");
    const createArg = mockPrisma.ticket.create.mock.calls[0][0];
    expect(createArg.data.softwareName).toBeUndefined();
  });

  it("returns the created ticket", async () => {
    const result = await createTicket(baseInput, "user-1", "Test User");
    expect(result.id).toBe("ticket-1");
  });
});

describe("listTickets", () => {
  it("returns tickets and total count", async () => {
    mockPrisma.ticket.findMany.mockResolvedValue([mockTicket]);
    mockPrisma.ticket.count.mockResolvedValue(1);

    const result = await listTickets({ role: "admin", userId: "user-1", page: 1, pageSize: 20 });
    expect(result.tickets).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("uses correct pagination parameters", async () => {
    mockPrisma.ticket.findMany.mockResolvedValue([]);
    mockPrisma.ticket.count.mockResolvedValue(0);

    await listTickets({ role: "admin", userId: "user-1", page: 2, pageSize: 10 });

    expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });
});
