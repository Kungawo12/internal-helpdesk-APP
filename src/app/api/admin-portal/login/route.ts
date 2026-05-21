import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rateLimit";

// M-11: legacy admin_token cookie removed — admin auth is handled solely by NextAuth.
// This route now validates the passkey and credentials; the frontend then calls
// NextAuth signIn to establish the session.

/**
 * Constant-time passkey comparison — mirrors the one in setup/route.ts.
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

    // SEC-2 fix: was missing await — isRateLimited is async, so the bare call
    // always returned a truthy Promise, making the guard always fire or never fire.
    if (await isRateLimited(`admin-login:${ip}`, 10, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { email, password, companyPasskey } = await req.json();

    if (!email || !password || !companyPasskey) {
      return NextResponse.json(
        { error: "Email, password, and company passkey are required" },
        { status: 400 }
      );
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

    // Passkey + credentials are valid. Frontend should call NextAuth signIn to create session.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin login error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
