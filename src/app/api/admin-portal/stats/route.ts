import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [totalUsers, totalTickets, openTickets, resolvedTickets, itTickets, hrTickets] =
      await Promise.all([
        prisma.user.count(),
        prisma.ticket.count(),
        prisma.ticket.count({ where: { status: "open" } }),
        prisma.ticket.count({ where: { status: "resolved" } }),
        prisma.ticket.count({ where: { type: "IT" } }),
        prisma.ticket.count({ where: { type: "HR" } }),
      ]);

    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: { role: true },
    });

    return NextResponse.json({
      totalUsers,
      totalTickets,
      openTickets,
      resolvedTickets,
      itTickets,
      hrTickets,
      usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count.role })),
    });
  } catch (error) {
    console.error("Admin portal stats error:", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
