import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

const VALID_ROLES = Object.values(UserRole);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const data: { role?: UserRole; active?: boolean } = {};

  if (body.role !== undefined) {
    if (!VALID_ROLES.includes(body.role)) {
      return NextResponse.json(
        { error: `Invalid role. Allowed values: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }
    data.role = body.role as UserRole;
  }

  if (body.active !== undefined) {
    if (typeof body.active !== "boolean") {
      return NextResponse.json({ error: "active must be a boolean" }, { status: 400 });
    }
    data.active = body.active;
  }

  try {
    // Fetch current values so we can log what changed
    const prev = await prisma.user.findUnique({
      where: { id },
      select: { role: true, active: true },
    });

    const user = await prisma.user.update({ where: { id }, data });

    // Audit log — role and active changes are security-sensitive
    if (data.role !== undefined && prev?.role !== data.role) {
      console.log(`[ADMIN_AUDIT] action=ROLE_CHANGED user_id=${id} old=${prev?.role} new=${data.role}`);
    }
    if (data.active !== undefined && prev?.active !== data.active) {
      console.log(`[ADMIN_AUDIT] action=ACTIVATION_CHANGED user_id=${id} old=${prev?.active} new=${data.active}`);
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Admin portal update user error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const permanent = searchParams.get("permanent") === "true";

  try {
    if (permanent) {
      // Hard delete — cascade removes tickets, comments, attachments via Prisma relations
      await prisma.feedback.deleteMany({ where: { ticket: { creatorId: id } } });
      await prisma.comment.deleteMany({ where: { userId: id } });
      await prisma.attachment.deleteMany({ where: { uploadedById: id } });
      await prisma.ticket.deleteMany({ where: { creatorId: id } });
      await prisma.user.delete({ where: { id } });
    } else {
      // Soft deactivate
      await prisma.user.update({ where: { id }, data: { active: false } });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin portal delete user error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
