import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Mark read error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to mark notifications read" }, { status: 500 });
  }
}
