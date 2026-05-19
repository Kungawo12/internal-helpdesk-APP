import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return Response.json(notifications);
  } catch (error) {
    console.error("Notifications fetch error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}
