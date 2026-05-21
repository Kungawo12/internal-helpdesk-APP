import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// M-4 fix: added "Software" to VALID_TICKET_TYPES. Previously, SLA policies
// could not be created for Software tickets, meaning Software tickets would
// never get SLA deadlines (sla.ts only has hardcoded defaults for IT and HR).
const VALID_TICKET_TYPES = ["IT", "HR", "Software"] as const;
const VALID_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

function validateMinutes(value: unknown, fieldName: string): string | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return `${fieldName} must be a positive integer`;
  }
  return null;
}

// SEC-4 fix: GET was unauthenticated -- anyone could read internal SLA configuration.
// Restricted to admin and manager roles (the only roles that act on SLA data).
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin" && session.user.role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const policies = await prisma.slaPolicy.findMany({
      orderBy: [{ ticketType: "asc" }, { priority: "asc" }],
    });

    return NextResponse.json(policies);
  } catch (error) {
    console.error("SLA policies fetch error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to load SLA policies" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { name, ticketType, priority, firstResponseMinutes, resolutionMinutes } = body;

    // Required field presence
    if (!name || !ticketType || !priority || firstResponseMinutes === undefined || resolutionMinutes === undefined) {
      return NextResponse.json(
        { error: "name, ticketType, priority, firstResponseMinutes, and resolutionMinutes are all required" },
        { status: 400 }
      );
    }

    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "name must be a non-empty string" }, { status: 400 });
    }

    if (!VALID_TICKET_TYPES.includes(ticketType)) {
      return NextResponse.json(
        { error: "ticketType must be IT, HR, or Software" },
        { status: 400 }
      );
    }

    if (!VALID_PRIORITIES.includes(priority)) {
      return NextResponse.json(
        { error: "priority must be low, medium, high, or urgent" },
        { status: 400 }
      );
    }

    const firstErr = validateMinutes(firstResponseMinutes, "firstResponseMinutes");
    if (firstErr) return NextResponse.json({ error: firstErr }, { status: 400 });

    const resErr = validateMinutes(resolutionMinutes, "resolutionMinutes");
    if (resErr) return NextResponse.json({ error: resErr }, { status: 400 });

    const policy = await prisma.slaPolicy.create({
      data: {
        name: name.trim(),
        ticketType,
        priority,
        firstResponseMinutes,
        resolutionMinutes,
      },
    });

    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    console.error("SLA policy create error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to create SLA policy" }, { status: 500 });
  }
}
