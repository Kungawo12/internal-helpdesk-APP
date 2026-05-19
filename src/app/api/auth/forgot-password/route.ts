import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { isRateLimited } from "@/lib/rateLimit";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    // L3: only trust x-vercel-forwarded-for (Vercel-set, not spoofable)
    const ip = req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // H1/H2: key rate limit on both IP and email to prevent spray attacks
    if (await isRateLimited(`forgot-password:${ip}:${email.toLowerCase()}`, 5, 15 * 60 * 1000)) {
      return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return Response.json({ message: "If that email exists, a reset link has been sent." });
    }

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email: user.email } });

    // H2: generate a raw token to put in the email link, but store only its SHA-256 hash.
    // A DB read-leak cannot be used to reset passwords without the original token.
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { token: tokenHash, email: user.email, expiresAt },
    });

    // Send the raw (un-hashed) token in the email link
    await sendPasswordResetEmail(user.email, rawToken);

    return Response.json({ message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
