import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        creator: { select: { name: true, email: true } },
        assignee: { select: { name: true, email: true } },
        feedback: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Admin portal tickets error:", error);
    return NextResponse.json({ error: "Failed to load tickets" }, { status: 500 });
  }
}
