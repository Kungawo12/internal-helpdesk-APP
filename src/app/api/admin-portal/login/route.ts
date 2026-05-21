import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rateLimit";

// M-11: legacy admin_token cookie removed -- admin auth is handled solely by NextAuth.
// This route now validates the passkey and credentials; the frontend then calls
// NextAuth signIn to establish the session.

/**
 * Constant-time passkey comparison -- mirrors the one in setup/route.ts.
 * Both strings are SHA-256 hashed first so timingSafeEqual always receives
 * equal-length buffers (the function throws on length mismatch).
 */
function timingSafePasskeyEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    // SEC-2 fix: was missing await on isRateLimited
    if (await isRateLimited(`admin-login:ip:${ip}`, 10, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const { email, password, companyPasskey } = body;

    if (!email || !password || !companyPasskey) {
      return NextResponse.json(
        { error: "Email, password, and company passkey are required" },
        { status: 400 }
      );
    }

    // M-5 fix: add per-email rate limit to complement the per-IP limit.
    // An attacker with a botnet can bypass IP-based throttling; keying on
    // the target email address catches credential stuffing regardless of
    // how many source IPs are used. Tighter window (30 min, 5 attempts)
    // for admin logins -- higher-value target.
    if (await isRateLimited(`admin-login:email:${email.toLowerCase()}`, 5, 30 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const expectedPasskey = process.env.ADMIN_PASSKEY;
    // SEC-3 fix: use timing-safe comparison instead of !== to prevent
    // timing-based oracle attacks on the passkey.
    if (!expectedPasskey || !timingSafePasskeyEqual(companyPasskey, expectedPasskey)) {
      return NextResponse.json({ error: "Invalid company passkey" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.role !== "admin" || !user.active || !user.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin portal login error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
