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

    // Tickets created per day — last 14 days
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const dailyCounts: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const count = allTickets.filter((t) => t.createdAt.toISOString().slice(0, 10) === dateStr).length;
      dailyCounts.push({ date: dateStr, count });
    }

    // SLA compliance
    const totalResolved = resolvedTickets.length;
    const slaCompliant = resolvedTickets.filter((t) => !t.slaBreached).length;
    const slaComplianceRate = totalResolved > 0 ? Math.round((slaCompliant / totalResolved) * 100) : null;

    // Average resolution time (hours)
    let avgResolutionHours: number | null = null;
    if (totalResolved > 0) {
      const totalMs = resolvedTickets.reduce((sum, t) => {
        return sum + (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime());
      }, 0);
      avgResolutionHours = Math.round(totalMs / totalResolved / (1000 * 60 * 60) * 10) / 10;
    }

    return Response.json({
      totals: { total: allTickets.length, ...byStatus },
      byType,
      byPriority,
      dailyCounts,
      sla: {
        complianceRate: slaComplianceRate,
        compliant: slaCompliant,
        breached: totalResolved - slaCompliant,
        total: totalResolved,
      },
      avgResolutionHours,
    });
  } catch (error) {
    console.error("Reports error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to load reports" }, { status: 500 });
  }
}
