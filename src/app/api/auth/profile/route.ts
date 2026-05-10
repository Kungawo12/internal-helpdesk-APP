import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { name, currentPassword, newPassword } = await req.json();

    if (!name || name.trim().length < 2) {
      return Response.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }

    const updateData: { name: string; password?: string } = { name: name.trim() };

    if (newPassword) {
      if (newPassword.length < 8) {
        return Response.json({ error: "New password must be at least 8 characters" }, { status: 400 });
      }

      if (!currentPassword) {
        return Response.json({ error: "Current password is required to set a new password" }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
      });

      if (!user?.password) {
        return Response.json({ error: "Account has no password set" }, { status: 400 });
      }

      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return Response.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true },
    });

    return Response.json(updated);
  } catch (error) {
    console.error("Profile update error:", error);
    return Response.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
