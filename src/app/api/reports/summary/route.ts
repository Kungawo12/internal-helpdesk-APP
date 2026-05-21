import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// M-3 / P-2 fixes:
// - M-3: the 14-day daily chart now uses a separate DB-filtered query so we
//   don't load all historical tickets into memory just to count recent ones.
// - P-2: removed the redundant second prisma.ticket.findMany for resolved
//   tickets -- avg resolution time is now computed from allTickets which
//   already includes resolved rows with createdAt/updatedAt.

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { role } = session.user;
    if (role !== "admin" && role !== "manager") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    // Single query for totals -- includes all historical tickets
    const allTickets = await prisma.ticket.findMany({
      select: {
        status: true,
        type: true,
        priority: true,
        slaBreached: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // P-2 fix: separate date-filtered query for the chart only (not a full table scan)
    const recentTickets = await prisma.ticket.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true },
    });

    // Status / type / priority breakdowns over all tickets
    const byStatus = { open: 0, in_progress: 0, resolved: 0, closed: 0 } as Record<string, number>;
    const byType = { IT: 0, HR: 0, Software: 0 } as Record<string, number>;
    const byPriority = { low: 0, medium: 0, high: 0, urgent: 0 } as Record<string, number>;

    // Avg resolution time computed from allTickets (P-2 fix -- no second query)
    let resolvedCount = 0;
    let totalResolutionMs = 0;

    for (const t of allTickets) {
      byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
      byType[t.type] = (byType[t.type] ?? 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] ?? 0) + 1;

      if (t.status === "resolved") {
        resolvedCount++;
        totalResolutionMs += t.updatedAt.getTime() - t.createdAt.getTime();
      }
    }

    const avgResolutionHours =
      resolvedCount > 0
        ? Math.round((totalResolutionMs / resolvedCount / 3600000) * 10) / 10
        : 0;

    // Daily chart -- single pass over the date-filtered recentTickets (M-3 fix)
    const dailyMap = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dailyMap.set(d.toISOString().slice(0, 10), 0);
    }
    for (const t of recentTickets) {
      const key = t.createdAt.toISOString().slice(0, 10);
      if (dailyMap.has(key)) {
        dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
      }
    }
    const dailyTickets = Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count }));

    return Response.json({
      byStatus,
      byType,
      byPriority,
      avgResolutionHours,
      dailyTickets,
      totalTickets: allTickets.length,
      slaBreachedCount: allTickets.filter((t) => t.slaBreached).length,
    });
  } catch (error) {
    console.error("Reports summary error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to load summary" }, { status: 500 });
  }
}
