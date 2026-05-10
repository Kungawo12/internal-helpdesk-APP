import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

// POST /api/admin-portal/wipe
// body: { target: "tickets" | "users" | "all", confirm: "WIPE" }
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { target, confirm } = await req.json();

    if (confirm !== "WIPE") {
      return NextResponse.json({ error: "Confirmation required" }, { status: 400 });
    }

    if (target === "tickets") {
      // Delete in dependency order: feedback, comments, attachments, then tickets
      await prisma.feedback.deleteMany();
      await prisma.comment.deleteMany();
      await prisma.attachment.deleteMany();
      await prisma.ticket.deleteMany();
      return NextResponse.json({ success: true, message: "All tickets wiped" });
    }

    if (target === "users") {
      // Wipe all non-admin users (keep admins so portal stays accessible)
      const admins = await prisma.user.findMany({ where: { role: "admin" }, select: { id: true } });
      const adminIds = admins.map((a) => a.id);

      // Delete tickets of non-admin users first
      await prisma.feedback.deleteMany({ where: { ticket: { creatorId: { notIn: adminIds } } } });
      await prisma.comment.deleteMany({ where: { userId: { notIn: adminIds } } });
      await prisma.attachment.deleteMany({ where: { uploadedById: { notIn: adminIds } } });
      // AuditLog has no cascade on user relation — must delete explicitly before user deletion
      await prisma.auditLog.deleteMany({ where: { userId: { notIn: adminIds } } });
      await prisma.ticket.deleteMany({ where: { creatorId: { notIn: adminIds } } });
      await prisma.user.deleteMany({ where: { role: { not: "admin" } } });

      return NextResponse.json({ success: true, message: "All non-admin users wiped" });
    }

    if (target === "all") {
      // Full wipe — clear everything except admin accounts
      const admins = await prisma.user.findMany({ where: { role: "admin" }, select: { id: true } });
      const adminIds = admins.map((a) => a.id);

      await prisma.feedback.deleteMany();
      await prisma.comment.deleteMany();
      await prisma.attachment.deleteMany();
      await prisma.auditLog.deleteMany({ where: { userId: { notIn: adminIds } } });
      await prisma.ticket.deleteMany();
      await prisma.user.deleteMany({ where: { id: { notIn: adminIds } } });

      return NextResponse.json({ success: true, message: "Full wipe complete (admin accounts preserved)" });
    }

    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  } catch (error) {
    console.error("Admin wipe error:", error);
    return NextResponse.json({ error: "Wipe failed" }, { status: 500 });
  }
}
