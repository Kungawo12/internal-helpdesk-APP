import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

const VALID_TYPES = ["IT", "HR"] as const;
const VALID_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const policies = await prisma.slaPolicy.findMany({
      orderBy: [{ ticketType: "asc" }, { priority: "asc" }],
    });
    return NextResponse.json(policies);
  } catch (error) {
    console.error("Admin portal SLA policies fetch error:", error);
    return NextResponse.json({ error: "Failed to load SLA policies" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, ticketType, priority, firstResponseMinutes, resolutionMinutes } = await req.json();

    if (!name || !ticketType || !priority || firstResponseMinutes == null || resolutionMinutes == null) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (!VALID_TYPES.includes(ticketType)) {
      return NextResponse.json({ error: "ticketType must be IT or HR" }, { status: 400 });
    }
    if (!VALID_PRIORITIES.includes(priority)) {
      return NextResponse.json({ error: "priority must be low, medium, high, or urgent" }, { status: 400 });
    }
    if (!Number.isInteger(firstResponseMinutes) || firstResponseMinutes <= 0) {
      return NextResponse.json({ error: "firstResponseMinutes must be a positive integer" }, { status: 400 });
    }
    if (!Number.isInteger(resolutionMinutes) || resolutionMinutes <= 0) {
      return NextResponse.json({ error: "resolutionMinutes must be a positive integer" }, { status: 400 });
    }

    const existing = await prisma.slaPolicy.findFirst({ where: { ticketType, priority } });
    if (existing) {
      return NextResponse.json({ error: `A policy for ${ticketType} / ${priority} already exists` }, { status: 409 });
    }

    const policy = await prisma.slaPolicy.create({
      data: { name: name.trim(), ticketType, priority, firstResponseMinutes, resolutionMinutes },
    });
    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    console.error("Admin portal SLA policy create error:", error);
    return NextResponse.json({ error: "Failed to create SLA policy" }, { status: 500 });
  }
}
