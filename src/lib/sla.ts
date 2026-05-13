import { prisma } from "@/lib/prisma";

// SLA minutes by type + priority (defaults used when no SlaPolicy row exists)
const DEFAULT_SLA: Record<string, Record<string, { firstResponse: number; resolution: number }>> = {
  IT: {
    urgent: { firstResponse: 60,   resolution: 240  },  // 1h / 4h
    high:   { firstResponse: 240,  resolution: 480  },  // 4h / 8h
    medium: { firstResponse: 480,  resolution: 1440 },  // 8h / 24h
    low:    { firstResponse: 1440, resolution: 2880 },  // 24h / 48h
  },
  HR: {
    urgent: { firstResponse: 240,  resolution: 1440 },
    high:   { firstResponse: 480,  resolution: 2880 },
    medium: { firstResponse: 1440, resolution: 5760 },
    low:    { firstResponse: 2880, resolution: 11520 },
  },
};

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export async function attachSlaToTicket(
  ticketId: string,
  type: string,
  priority: string,
  createdAt: Date
) {
  try {
    // Try to find a custom SLA policy first
    const policy = await prisma.slaPolicy.findFirst({
      where: { ticketType: type, priority },
    });

    let firstResponseMinutes: number;
    let resolutionMinutes: number;
    let slaPolicyId: string | null = null;

    if (policy) {
      firstResponseMinutes = policy.firstResponseMinutes;
      resolutionMinutes = policy.resolutionMinutes;
      slaPolicyId = policy.id;
    } else {
      const defaults = DEFAULT_SLA[type]?.[priority];
      if (!defaults) return;
      firstResponseMinutes = defaults.firstResponse;
      resolutionMinutes = defaults.resolution;
    }

    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        slaPolicyId,
        slaFirstResponseDue: addMinutes(createdAt, firstResponseMinutes),
        slaResolutionDue: addMinutes(createdAt, resolutionMinutes),
      },
    });
  } catch (err) {
    console.error("[SLA] Failed to attach SLA:", err);
  }
}

export function getSlaStatus(ticket: {
  slaResolutionDue: Date | null;
  slaBreached: boolean;
  status: string;
}): "on_track" | "at_risk" | "breached" | "resolved" | "none" {
  if (ticket.status === "resolved") return "resolved";
  if (!ticket.slaResolutionDue) return "none";
  if (ticket.slaBreached) return "breached";

  const now = Date.now();
  const due = new Date(ticket.slaResolutionDue).getTime();
  const remaining = due - now;

  if (remaining < 0) return "breached";
  if (remaining < 60 * 60 * 1000) return "at_risk"; // < 1 hour remaining
  return "on_track";
}

export function formatSlaCountdown(dueDate: Date | null): string {
  if (!dueDate) return "";
  const diff = new Date(dueDate).getTime() - Date.now();
  if (diff < 0) return "Breached";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}
