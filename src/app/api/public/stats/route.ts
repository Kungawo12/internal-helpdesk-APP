export const revalidate = 3600; // cache for 1 hour — public marketing endpoint

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalTickets, resolvedTickets, totalUsers, recentResolved] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: "resolved" } }),
      prisma.user.count({ where: { active: true } }),
      prisma.ticket.findMany({
        where: { status: "resolved", updatedAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, updatedAt: true },
      }),
    ]);

    // Average resolution time in hours (updatedAt ≈ resolvedAt for resolved tickets)
    let avgResolutionHours = 0;
    if (recentResolved.length > 0) {
      const totalMs = recentResolved.reduce((sum, t) => {
        return sum + (t.updatedAt.getTime() - t.createdAt.getTime());
      }, 0);
      avgResolutionHours = Math.round((totalMs / recentResolved.length / 3600000) * 10) / 10;
    }

    return Response.json({ totalTickets, resolvedTickets, totalUsers, avgResolutionHours });
  } catch {
    return Response.json({ totalTickets: 0, resolvedTickets: 0, totalUsers: 0, avgResolutionHours: 0 });
  }
}
