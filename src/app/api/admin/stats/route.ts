import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "manager" && session.user.role !== "admin")) {
      return Response.json({ error: "Manager or admin access required" }, { status: 403 });
    }

    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      itTickets,
      hrTickets,
      totalUsers,
      feedbacks,
      recentTickets,
      ticketsByMonth,
    ] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: "open" } }),
      prisma.ticket.count({ where: { status: "in_progress" } }),
      prisma.ticket.count({ where: { status: "resolved" } }),
      prisma.ticket.count({ where: { type: "IT" } }),
      prisma.ticket.count({ where: { type: "HR" } }),
      prisma.user.count({ where: { active: true } }),
      prisma.feedback.findMany({ select: { rating: true } }),
      prisma.ticket.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          creator: { select: { name: true } },
        },
      }),
      prisma.ticket.findMany({
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // Calculate average satisfaction
    const avgSatisfaction = feedbacks.length > 0
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : "0";

    // Calculate average resolution time
    const resolvedWithTime = await prisma.ticket.findMany({
      where: { status: "resolved" },
      select: { createdAt: true, updatedAt: true },
    });

    let avgResolutionHours = "0";
    if (resolvedWithTime.length > 0) {
      const totalMs = resolvedWithTime.reduce((sum, t) => {
        return sum + (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime());
      }, 0);
      avgResolutionHours = (totalMs / resolvedWithTime.length / (1000 * 60 * 60)).toFixed(1);
    }

    // Group tickets by month
    const monthlyData: Record<string, number> = {};
    ticketsByMonth.forEach((t) => {
      const key = new Date(t.createdAt).toISOString().slice(0, 7); // "2026-05"
      monthlyData[key] = (monthlyData[key] || 0) + 1;
    });

    // Priority breakdown
    const priorities = await Promise.all([
      prisma.ticket.count({ where: { priority: "low" } }),
      prisma.ticket.count({ where: { priority: "medium" } }),
      prisma.ticket.count({ where: { priority: "high" } }),
      prisma.ticket.count({ where: { priority: "urgent" } }),
    ]);

    return Response.json({
      overview: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        itTickets,
        hrTickets,
        totalUsers,
        avgSatisfaction,
        avgResolutionHours,
      },
      priority: {
        low: priorities[0],
        medium: priorities[1],
        high: priorities[2],
        urgent: priorities[3],
      },
      monthly: monthlyData,
      recentTickets: recentTickets.map((t) => ({
        id: t.id,
        title: t.title,
        type: t.type,
        status: t.status,
        priority: t.priority,
        createdAt: t.createdAt,
        creator: t.creator.name,
      })),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return Response.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
