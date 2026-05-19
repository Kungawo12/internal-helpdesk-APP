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

    const staffUsers = await prisma.user.findMany({
      where: {
        active: true,
        OR: [{ role: "it_staff" }, { role: "hr_staff" }],
      },
      select: { id: true, name: true, role: true },
      orderBy: { name: "asc" },
    });

    const workload = await Promise.all(
      staffUsers.map(async (user) => {
        const [open, inProgress, resolved, breached] = await Promise.all([
          prisma.ticket.count({ where: { assigneeId: user.id, status: "open" } }),
          prisma.ticket.count({ where: { assigneeId: user.id, status: "in_progress" } }),
          prisma.ticket.findMany({
            where: { assigneeId: user.id, status: { in: ["resolved", "closed"] } },
            select: { createdAt: true, updatedAt: true },
          }),
          prisma.ticket.count({ where: { assigneeId: user.id, slaBreached: true } }),
        ]);

        const avgResolutionHours =
          resolved.length > 0
            ? Math.round(
                (resolved.reduce(
                  (sum, t) => sum + (t.updatedAt.getTime() - t.createdAt.getTime()),
                  0
                ) /
                  resolved.length /
                  (1000 * 60 * 60)) *
                  10
              ) / 10
            : null;

        return {
          id: user.id,
          name: user.name,
          role: user.role,
          open,
          inProgress,
          resolved: resolved.length,
          totalActive: open + inProgress,
          slaBreached: breached,
          avgResolutionHours,
        };
      })
    );

    return Response.json(workload);
  } catch (error) {
    console.error("Workload error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to load workload" }, { status: 500 });
  }
}
