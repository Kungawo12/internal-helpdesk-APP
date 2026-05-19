import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // --- Weekly ticket volume (last 8 weeks) ---
    const weeks: { label: string; start: Date; end: Date }[] = [];
    for (let i = 7; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - i * 7 - start.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      weeks.push({
        label: start.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        start,
        end,
      });
    }

    const weeklyVolume = await Promise.all(
      weeks.map(async (w) => ({
        label: w.label,
        count: await prisma.ticket.count({
          where: { createdAt: { gte: w.start, lte: w.end } },
        }),
      }))
    );

    // --- MTTR: mean time to resolve in hours ---
    const resolvedTickets = await prisma.ticket.findMany({
      where: { status: { in: ["resolved", "closed"] } },
      select: { createdAt: true, updatedAt: true, type: true },
    });

    const toHours = (ms: number) => ms / (1000 * 60 * 60);

    const mttrAll =
      resolvedTickets.length > 0
        ? resolvedTickets.reduce(
            (sum, t) => sum + toHours(t.updatedAt.getTime() - t.createdAt.getTime()),
            0
          ) / resolvedTickets.length
        : 0;

    const itResolved = resolvedTickets.filter((t) => t.type === "IT");
    const hrResolved = resolvedTickets.filter((t) => t.type === "HR");

    const mttrIT =
      itResolved.length > 0
        ? itResolved.reduce(
            (sum, t) => sum + toHours(t.updatedAt.getTime() - t.createdAt.getTime()),
            0
          ) / itResolved.length
        : 0;

    const mttrHR =
      hrResolved.length > 0
        ? hrResolved.reduce(
            (sum, t) => sum + toHours(t.updatedAt.getTime() - t.createdAt.getTime()),
            0
          ) / hrResolved.length
        : 0;

    // --- SLA breach rate ---
    const [totalWithSla, totalBreached] = await Promise.all([
      prisma.ticket.count({ where: { slaResolutionDue: { not: null } } }),
      prisma.ticket.count({ where: { slaBreached: true } }),
    ]);
    const breachRate = totalWithSla > 0 ? (totalBreached / totalWithSla) * 100 : 0;

    // --- By department ---
    const [itTotal, hrTotal, itResol, hrResol, itBreached, hrBreached] = await Promise.all([
      prisma.ticket.count({ where: { type: "IT" } }),
      prisma.ticket.count({ where: { type: "HR" } }),
      prisma.ticket.count({ where: { type: "IT", status: { in: ["resolved", "closed"] } } }),
      prisma.ticket.count({ where: { type: "HR", status: { in: ["resolved", "closed"] } } }),
      prisma.ticket.count({ where: { type: "IT", slaBreached: true } }),
      prisma.ticket.count({ where: { type: "HR", slaBreached: true } }),
    ]);

    // --- Ticket age buckets (open tickets only) ---
    const openTickets = await prisma.ticket.findMany({
      where: { status: { in: ["open", "in_progress"] } },
      select: { createdAt: true },
    });

    const ageBuckets = { under1h: 0, under8h: 0, under24h: 0, under3d: 0, over3d: 0 };
    for (const t of openTickets) {
      const ageHours = toHours(now.getTime() - t.createdAt.getTime());
      if (ageHours < 1) ageBuckets.under1h++;
      else if (ageHours < 8) ageBuckets.under8h++;
      else if (ageHours < 24) ageBuckets.under24h++;
      else if (ageHours < 72) ageBuckets.under3d++;
      else ageBuckets.over3d++;
    }

    // --- CSAT stats ---
    const allFeedback = await prisma.feedback.findMany({
      select: { rating: true },
    });

    const totalRated = allFeedback.length;
    const avgRating =
      totalRated > 0
        ? allFeedback.reduce((sum, f) => sum + f.rating, 0) / totalRated
        : 0;

    const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: allFeedback.filter((f) => f.rating === star).length,
    }));

    const totalResolved = await prisma.ticket.count({
      where: { status: { in: ["resolved", "closed"] } },
    });
    const csatResponseRate = totalResolved > 0 ? (totalRated / totalResolved) * 100 : 0;

    // --- Top 5 resolvers (staff) ---
    const topResolvers = await prisma.ticket.groupBy({
      by: ["assigneeId"],
      where: { status: { in: ["resolved", "closed"] }, assigneeId: { not: null } },
      _count: { assigneeId: true },
      orderBy: { _count: { assigneeId: "desc" } },
      take: 5,
    });

    const resolverDetails = await Promise.all(
      topResolvers
        .filter((r) => r.assigneeId !== null)
        .map(async (r) => {
          const user = await prisma.user.findUnique({
            where: { id: r.assigneeId! },
            select: { name: true, role: true },
          });
          return { name: user?.name ?? "Unknown", role: user?.role ?? "", resolved: r._count.assigneeId };
        })
    );

    return NextResponse.json({
      weeklyVolume,
      mttr: {
        all: Math.round(mttrAll * 10) / 10,
        it: Math.round(mttrIT * 10) / 10,
        hr: Math.round(mttrHR * 10) / 10,
      },
      sla: {
        totalWithSla,
        totalBreached,
        breachRate: Math.round(breachRate * 10) / 10,
        complianceRate: Math.round((100 - breachRate) * 10) / 10,
      },
      byDepartment: {
        IT: { total: itTotal, resolved: itResol, breached: itBreached },
        HR: { total: hrTotal, resolved: hrResol, breached: hrBreached },
      },
      openTicketAge: ageBuckets,
      topResolvers: resolverDetails,
      csat: {
        totalRated,
        avgRating: Math.round(avgRating * 10) / 10,
        responseRate: Math.round(csatResponseRate * 10) / 10,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
