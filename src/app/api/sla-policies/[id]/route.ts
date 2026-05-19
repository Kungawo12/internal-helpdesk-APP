import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_TICKET_TYPES = ["IT", "HR"] as const;
const VALID_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

function validateMinutes(value: unknown, fieldName: string): string | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return `${fieldName} must be a positive integer`;
  }
  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, ticketType, priority, firstResponseMinutes, resolutionMinutes } = body;

    // Must provide at least one field
    if (
      name === undefined &&
      ticketType === undefined &&
      priority === undefined &&
      firstResponseMinutes === undefined &&
      resolutionMinutes === undefined
    ) {
      return NextResponse.json({ error: "No fields provided to update" }, { status: 400 });
    }

    // Validate each provided field
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "name must be a non-empty string" }, { status: 400 });
      }
    }

    if (ticketType !== undefined && !VALID_TICKET_TYPES.includes(ticketType)) {
      return NextResponse.json({ error: "ticketType must be \"IT\" or \"HR\"" }, { status: 400 });
    }

    if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
      return NextResponse.json(
        { error: "priority must be one of: low, medium, high, urgent" },
        { status: 400 }
      );
    }

    if (firstResponseMinutes !== undefined) {
      const err = validateMinutes(firstResponseMinutes, "firstResponseMinutes");
      if (err) return NextResponse.json({ error: err }, { status: 400 });
    }

    if (resolutionMinutes !== undefined) {
      const err = validateMinutes(resolutionMinutes, "resolutionMinutes");
      if (err) return NextResponse.json({ error: err }, { status: 400 });
    }

    // Confirm the policy exists
    const existing = await prisma.slaPolicy.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "SLA policy not found" }, { status: 404 });
    }

    // If ticketType or priority is being changed, check the target combo is not already taken
    const targetType = ticketType ?? existing.ticketType;
    const targetPriority = priority ?? existing.priority;

    if (ticketType !== undefined || priority !== undefined) {
      const conflict = await prisma.slaPolicy.findFirst({
        where: {
          ticketType: targetType,
          priority: targetPriority,
          NOT: { id },
        },
      });

      if (conflict) {
        return NextResponse.json(
          { error: `An SLA policy already exists for ${targetType} / ${targetPriority}` },
          { status: 409 }
        );
      }
    }

    const updateData: {
      name?: string;
      ticketType?: string;
      priority?: string;
      firstResponseMinutes?: number;
      resolutionMinutes?: number;
    } = {};

    if (name !== undefined) updateData.name = name.trim();
    if (ticketType !== undefined) updateData.ticketType = ticketType;
    if (priority !== undefined) updateData.priority = priority;
    if (firstResponseMinutes !== undefined) updateData.firstResponseMinutes = firstResponseMinutes;
    if (resolutionMinutes !== undefined) updateData.resolutionMinutes = resolutionMinutes;

    const updated = await prisma.slaPolicy.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("SLA policy update error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to update SLA policy" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.slaPolicy.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "SLA policy not found" }, { status: 404 });
    }

    await prisma.slaPolicy.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SLA policy delete error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to delete SLA policy" }, { status: 500 });
  }
}
