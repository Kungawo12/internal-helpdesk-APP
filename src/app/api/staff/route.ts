import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// M-1 fix: added "Software" type mapping to ai_staff, and ai_staff to the
// default (no-type) query. Previously, /api/staff?type=Software returned an
// empty list because ai_staff was never included, causing empty assignee
// dropdowns in the admin UI for Software tickets.
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin" && session.user.role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const type = new URL(req.url).searchParams.get("type");

    const where =
      type === "IT"
        ? { role: "it_staff" as const, active: true }
        : type === "HR"
        ? { role: "hr_staff" as const, active: true }
        : type === "Software"
        ? { role: "ai_staff" as const, active: true }
        : {
            active: true,
            OR: [
              { role: "it_staff" as const },
              { role: "hr_staff" as const },
              { role: "ai_staff" as const },
            ],
          };

    const staff = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Staff list error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to load staff" }, { status: 500 });
  }
}
