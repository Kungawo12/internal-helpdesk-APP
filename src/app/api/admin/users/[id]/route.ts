import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const { role, active } = await req.json();

    // Prevent admin from deactivating themselves
    if (id === session.user.id && active === false) {
      return Response.json({ error: "Cannot deactivate your own account" }, { status: 400 });
    }

    const validRoles = ["employee", "it_staff", "hr_staff", "ai_staff", "admin"];
    const updateData: { role?: string; active?: boolean } = {};

    if (role !== undefined) {
      if (!validRoles.includes(role)) {
        return Response.json({ error: "Invalid role" }, { status: 400 });
      }
      updateData.role = role;
    }

    if (active !== undefined) {
      updateData.active = active;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });

    return Response.json(user);
  } catch (error) {
    console.error("Admin update user error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    if (id === session.user.id) {
      return Response.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    // Soft delete — deactivate instead of hard delete
    await prisma.user.update({
      where: { id },
      data: { active: false },
    });

    return Response.json({ message: "User deactivated" });
  } catch (error) {
    console.error("Admin delete user error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
