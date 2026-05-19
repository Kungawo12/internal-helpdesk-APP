import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const logs = await prisma.auditLog.findMany({
      where: { ticketId: id },
      include: {
        user: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Fetch audit log error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to load audit log" }, { status: 500 });
  }
}
