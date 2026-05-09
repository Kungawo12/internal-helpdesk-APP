import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "manager" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const type = new URL(req.url).searchParams.get("type");

    const where =
      type === "IT"
        ? { role: "it_staff", active: true }
        : type === "HR"
        ? { role: "hr_staff", active: true }
        : { active: true, OR: [{ role: "it_staff" }, { role: "hr_staff" }] };

    const staff = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Staff list error:", error);
    return NextResponse.json({ error: "Failed to load staff" }, { status: 500 });
  }
}
