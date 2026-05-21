import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rateLimit";

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
          /**
           * FIX M4: Only use x-vercel-forwarded-for for IP extraction.
           *
           * WHY THE OLD CODE WAS WRONG:
           *   The previous code had a fallback to x-forwarded-for:
           *     req.headers.get("x-vercel-forwarded-for")
           *       ?? req.headers.get("x-forwarded-for")   <-- attacker-controlled!
           *       ?? "unknown"
           *
           *   x-forwarded-for is a standard header that ANY HTTP client can set to
           *   any arbitrary value.  An attacker running a botnet credential-stuffing
           *   attack could set a different fake IP in each request, cycling through
           *   e.g. "1.2.3.4", "1.2.3.5", "1.2.3.6" to bypass the per-IP rate limit.
           *
           * THE FIX:
           *   Only trust x-vercel-forwarded-for, which is injected by Vercel's own
           *   edge proxy and cannot be spoofed by the client (Vercel strips any
           *   client-supplied version of this header).  If the header is absent,
           *   fall back to "unknown" — all unknown-IP requests share one rate-limit
           *   bucket, which is a safe conservative default.
           *
           *   This is identical to the pattern used in every other rate-limited
           *   endpoint in the codebase (register, forgot-password, reset-password).
           */
      const ip =
              req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
              "unknown";

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

      // Per-email rate limit to catch credential stuffing across multiple source IPs
      if (await isRateLimited(`admin-login:email:${email.toLowerCase()}`, 5, 30 * 60 * 1000)) {
              return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
      }

      const expectedPasskey = process.env.ADMIN_PASSKEY;
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
