import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

const VALID_TYPES = ["IT", "HR"] as const;
const VALID_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.ticketType !== undefined) {
      if (!VALID_TYPES.includes(body.ticketType)) {
        return NextResponse.json({ error: "ticketType must be IT or HR" }, { status: 400 });
      }
      data.ticketType = body.ticketType;
    }
    if (body.priority !== undefined) {
      if (!VALID_PRIORITIES.includes(body.priority)) {
        return NextResponse.json({ error: "priority must be low, medium, high, or urgent" }, { status: 400 });
      }
      data.priority = body.priority;
    }
    if (body.firstResponseMinutes !== undefined) {
      if (!Number.isInteger(body.firstResponseMinutes) || body.firstResponseMinutes <= 0) {
        return NextResponse.json({ error: "firstResponseMinutes must be a positive integer" }, { status: 400 });
      }
      data.firstResponseMinutes = body.firstResponseMinutes;
    }
    if (body.resolutionMinutes !== undefined) {
      if (!Number.isInteger(body.resolutionMinutes) || body.resolutionMinutes <= 0) {
        return NextResponse.json({ error: "resolutionMinutes must be a positive integer" }, { status: 400 });
      }
      data.resolutionMinutes = body.resolutionMinutes;
    }

    // Conflict check if type+priority combo is changing
    if (data.ticketType || data.priority) {
      const current = await prisma.slaPolicy.findUnique({ where: { id } });
      if (!current) return NextResponse.json({ error: "Policy not found" }, { status: 404 });

      const conflictType = (data.ticketType as string) ?? current.ticketType;
      const conflictPriority = (data.priority as string) ?? current.priority;
      const conflict = await prisma.slaPolicy.findFirst({
        where: { ticketType: conflictType, priority: conflictPriority, id: { not: id } },
      });
      if (conflict) {
        return NextResponse.json({ error: `A policy for ${conflictType} / ${conflictPriority} already exists` }, { status: 409 });
      }
    }

    const policy = await prisma.slaPolicy.update({ where: { id }, data });
    return NextResponse.json(policy);
  } catch (error) {
    console.error("Admin portal SLA policy update error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to update SLA policy" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.slaPolicy.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Policy not found" }, { status: 404 });

    await prisma.slaPolicy.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin portal SLA policy delete error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to delete SLA policy" }, { status: 500 });
  }
}
