import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { role } = session.user;
    if (role !== "admin" && role !== "manager") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const [allTickets, resolvedTickets] = await Promise.all([
      prisma.ticket.findMany({
        select: {
          status: true,
          type: true,
          priority: true,
          slaBreached: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.ticket.findMany({
        where: { status: "resolved" },
        select: { createdAt: true, updatedAt: true, slaBreached: true },
      }),
    ]);

    // Status breakdown
    const byStatus = { open: 0, in_progress: 0, resolved: 0, closed: 0 } as Record<string, number>;
    const byType = { IT: 0, HR: 0 } as Record<string, number>;
    const byPriority = { low: 0, medium: 0, high: 0, urgent: 0 } as Record<string, number>;

    for (const t of allTickets) {
      byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
      byType[t.type] = (byType[t.type] ?? 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] ?? 0) + 1;
    }

    // Issue-7 fix: tickets created per day (last 14 days) — computed in a single
    // pass over already-fetched allTickets instead of 14 separate .filter() calls.
    // This is O(n) instead of O(n x 14) and requires no extra DB query.
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const dailyMap = new Map<string, number>();

    // Pre-populate all 14 days with 0
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dailyMap.set(d.toISOString().slice(0, 10), 0);
    }

    // Single pass — increment each date bucket
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    for (const t of allTickets) {
      if (t.createdAt >= fourteenDaysAgo) {
        const key = t.createdAt.toISOString().slice(0, 10);
        if (dailyMap.has(key)) {
          dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
        }
      }
    }

    const dailyCounts = Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count }));

    // SLA compliance
    const totalResolved = resolvedTickets.length;
    const slaCompliant = resolvedTickets.filter((t) => !t.slaBreached).length;
    const slaComplianceRate = totalResolved > 0 ? Math.round((slaCompliant / totalResolved) * 100) : null;

    // Average resolution time (hours)
    const avgResolutionHours =
      totalResolved > 0
        ? Math.round(
            (resolvedTickets.reduce(
              (sum, t) => sum + (t.updatedAt.getTime() - t.createdAt.getTime()),
              0
            ) /
              totalResolved /
              3_600_000) *
              10
          ) / 10
        : null;

    return Response.json({
      byStatus,
      byType,
      byPriority,
      dailyCounts,
      slaComplianceRate,
      avgResolutionHours,
      totalTickets: allTickets.length,
      totalResolved,
    });
  } catch (error) {
    console.error("Reports summary error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
