import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return Response.json({ error: "Token and password are required" }, { status: 400 });
    }

    if (password.length < 10) {
      return Response.json({ error: "Password must be at least 10 characters" }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!resetToken) {
      return Response.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { token } });
      return Response.json({ error: "Reset link has expired. Please request a new one." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // M-14: bump passwordChangedAt so any existing JWTs are rejected on next rotation
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword, passwordChangedAt: new Date() },
    });

    // Delete the used token
    await prisma.passwordResetToken.delete({ where: { token } });

    return Response.json({ message: "Password reset successfully. You can now sign in." });
  } catch (error) {
    console.error("Reset password error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
