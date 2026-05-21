import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessTicket } from "@/lib/ticketAccess";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Issue-5 fix: the previous version checked authentication but not authorization.
    // An employee could call /api/tickets/<any-id>/audit and see the full audit trail
    // for tickets they don't own. Now we verify ticket access before returning logs.
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { type: true, creatorId: true },
    });
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    if (!canAccessTicket(session.user.role, session.user.id, ticket)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
