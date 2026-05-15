import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const [
      totalUsers,
      activeUsers,
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      itTickets,
      hrTickets,
      slaBreachedCount,
      slaAtRiskCount,
      usersByRole,
      priorityBreakdown,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { active: true } }),
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: "open" } }),
      prisma.ticket.count({ where: { status: "in_progress" } }),
      prisma.ticket.count({ where: { status: "resolved" } }),
      prisma.ticket.count({ where: { status: "closed" } }),
      prisma.ticket.count({ where: { type: "IT" } }),
      prisma.ticket.count({ where: { type: "HR" } }),
      prisma.ticket.count({ where: { slaBreached: true, status: { notIn: ["resolved", "closed"] } } }),
      prisma.ticket.count({
        where: {
          slaBreached: false,
          status: { notIn: ["resolved", "closed"] },
          slaResolutionDue: { gt: now, lt: new Date(now.getTime() + 60 * 60 * 1000) },
        },
      }),
      prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
      prisma.ticket.groupBy({ by: ["priority"], _count: { priority: true } }),
    ]);

    // Staff performance: single query with groupBy instead of N+1 per-staff loops
    const [staffUsers, staffTicketGroups] = await Promise.all([
      prisma.user.findMany({
        where: { role: { in: ["it_staff", "hr_staff"] }, active: true },
        select: { id: true, name: true, role: true, email: true },
      }),
      prisma.ticket.groupBy({
        by: ["assigneeId", "status"],
        where: { assigneeId: { not: null } },
        _count: { id: true },
      }),
    ]);

    const staffPerformance = staffUsers.map((staff) => {
      const groups = staffTicketGroups.filter((g) => g.assigneeId === staff.id);
      const assigned = groups.reduce((sum, g) => sum + g._count.id, 0);
      const resolved = groups.find((g) => g.status === "resolved")?._count.id ?? 0;
      const inProgress = groups.find((g) => g.status === "in_progress")?._count.id ?? 0;
      return {
        id: staff.id,
        name: staff.name,
        role: staff.role,
        email: staff.email,
        assigned,
        resolved,
        inProgress,
        open: assigned - resolved - inProgress,
      };
    });

    // Recent activity: last 10 tickets
    const recentTickets = await prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        priority: true,
        createdAt: true,
        creator: { select: { name: true } },
      },
    });

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      itTickets,
      hrTickets,
      slaBreachedCount,
      slaAtRiskCount,
      usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count.role })),
      priorityBreakdown: priorityBreakdown.map((p) => ({ priority: p.priority, count: p._count.priority })),
      staffPerformance,
      recentTickets,
    });
  } catch (error) {
    console.error("Admin portal stats error:", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
