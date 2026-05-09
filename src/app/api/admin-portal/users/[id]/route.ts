import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    const data: { role?: string; active?: boolean } = {};
    if (body.role !== undefined) data.role = body.role;
    if (body.active !== undefined) data.active = body.active;

    const user = await prisma.user.update({ where: { id }, data });
    return NextResponse.json(user);
  } catch (error) {
    console.error("Admin portal update user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.user.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin portal deactivate user error:", error);
    return NextResponse.json({ error: "Failed to deactivate user" }, { status: 500 });
  }
}
