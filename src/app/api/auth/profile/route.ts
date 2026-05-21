import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { passwordSchema, firstZodError } from "@/lib/schemas";

export async function PATCH(req: Request) {
    try {
          const session = await getServerSession(authOptions);
          if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

      const { name, currentPassword, newPassword } = await req.json();

      if (!name || name.trim().length < 2) {
              return Response.json({ error: "Name must be at least 2 characters" }, { status: 400 });
      }

      const updateData: { name: string; password?: string; passwordChangedAt?: Date } = {
              name: name.trim(),
      };

      if (newPassword) {
              /**
               * FIX H2 (Input Validation): Use passwordSchema from schemas.ts instead of
               * a hardcoded minimum length check.
               *
               * WHY THE OLD CODE WAS WRONG:
               *   The old check was `newPassword.length < 8` — an 8-character minimum.
               *   Every other auth path in the app (register, reset-password, admin setup)
               *   enforces 10 characters via passwordSchema.  This meant a user could
               *   intentionally downgrade their password strength by using the profile
               *   endpoint.
               *
               * THE FIX:
               *   We now import and re-use passwordSchema (min 10 chars) so the policy
               *   is enforced from a SINGLE source of truth. If the minimum ever changes,
               *   updating schemas.ts fixes it everywhere automatically.
               */
            const passwordResult = passwordSchema.safeParse(newPassword);
              if (!passwordResult.success) {
                        return Response.json(
                          { error: firstZodError(passwordResult.error) },
                          { status: 400 }
                                  );
              }

            if (!currentPassword) {
                      return Response.json(
                        { error: "Current password is required to set a new password" },
                        { status: 400 }
                                );
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
              // Bump passwordChangedAt so any existing JWTs are rejected on next rotation
            updateData.passwordChangedAt = new Date();
      }

      const updated = await prisma.user.update({
              where: { id: session.user.id },
              data: updateData,
              select: { id: true, name: true, email: true, role: true },
      });

      return Response.json(updated);
    } catch (error) {
          console.error("Profile update error:", error instanceof Error ? error.message : "unknown");
          return Response.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
