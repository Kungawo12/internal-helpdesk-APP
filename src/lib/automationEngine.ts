import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

// H4: escape every user-controlled string before embedding in HTML email bodies
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export async function evaluateRules(ticketId: string): Promise<void> {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, type: true, priority: true, status: true, assigneeId: true, title: true },
    });
    if (!ticket) return;

    const rules = await prisma.automationRule.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
    });

    for (const rule of rules) {
      // Check all conditions (null = any)
      if (rule.condTicketType && rule.condTicketType !== ticket.type) continue;
      if (rule.condPriority && rule.condPriority !== ticket.priority) continue;
      if (rule.condStatus && rule.condStatus !== ticket.status) continue;
      if (rule.condUnassigned && ticket.assigneeId !== null) continue;

      // Execute action
      if (rule.action === "assign_to_role" && rule.actionValue) {
        if (ticket.assigneeId) continue; // already assigned

        // A-3 fix: replaced N+1 query pattern (one prisma.ticket.count per staff member)
        // with a single aggregated GROUP BY query using prisma.ticket.groupBy.
        // Previously: O(staff_count) queries per rule. Now: O(1) query per rule.
        const staffMembers = await prisma.user.findMany({
          where: { role: rule.actionValue, active: true },
          select: { id: true, name: true },
        });
        if (staffMembers.length === 0) continue;

        // Single aggregated query for open ticket counts per staff member
        const openCounts = await prisma.ticket.groupBy({
          by: ["assigneeId"],
          where: {
            assigneeId: { in: staffMembers.map((s) => s.id) },
            status: { in: ["open", "in_progress"] },
          },
          _count: { assigneeId: true },
        });

        // Build a map from assigneeId -> count, defaulting to 0 for staff with no open tickets
        const countMap = new Map(openCounts.map((c) => [c.assigneeId, c._count.assigneeId]));
        const leastLoaded = staffMembers.reduce((best, s) => {
          const bestLoad = countMap.get(best.id) ?? 0;
          const sLoad = countMap.get(s.id) ?? 0;
          return sLoad < bestLoad ? s : best;
        }, staffMembers[0]);

        await prisma.ticket.update({
          where: { id: ticketId },
          data: { assigneeId: leastLoaded.id },
        });
        logAudit(ticketId, "system", "ASSIGNED", {
          field: "assigneeId",
          newValue: leastLoaded.name,
        }).catch(() => {});
      }

      if (rule.action === "escalate_priority" && rule.actionValue) {
        const PRIORITY_ORDER = ["low", "medium", "high", "urgent"] as const;
        const currentIdx = PRIORITY_ORDER.indexOf(ticket.priority as (typeof PRIORITY_ORDER)[number]);
        if (currentIdx === -1 || currentIdx >= PRIORITY_ORDER.length - 1) continue;

        const newPriority = PRIORITY_ORDER[currentIdx + 1];
        await prisma.ticket.update({
          where: { id: ticketId },
          data: { priority: newPriority },
        });
        logAudit(ticketId, "system", "PRIORITY_CHANGED", {
          field: "priority",
          oldValue: ticket.priority,
          newValue: newPriority,
        }).catch(() => {});
      }

      if (rule.action === "notify_admins") {
        const admins = await prisma.user.findMany({
          where: { role: "admin", active: true },
          select: { id: true, email: true },
        });

        const safeTitle = escapeHtml(ticket.title);
        const body = `<p>Automation rule <strong>${escapeHtml(rule.name)}</strong> triggered on ticket: <strong>${safeTitle}</strong> (${ticket.type} / ${ticket.priority})</p>`;

        await Promise.all(
          admins.map((admin) =>
            import("@/lib/email")
              .then((m) => m.sendRawEmail?.(admin.email, `[AutoRule] ${ticket.title}`, body))
              .catch(() => {})
          )
        );
      }
    }
  } catch (err) {
    console.error("[AutomationEngine] Error:", err instanceof Error ? err.message : "unknown");
  }
}
