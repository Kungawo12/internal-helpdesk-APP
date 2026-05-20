import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * Constant-time passkey comparison.
 * Both strings are SHA-256 hashed first so timingSafeEqual always receives
 * equal-length buffers (the function throws on length mismatch).
 */
function timingSafePasskeyEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

async function adminExists(): Promise<boolean> {
  const count = await prisma.user.count({ where: { role: "admin" } });
  return count > 0;
}

export async function GET() {
  try {
    const exists = await adminExists();
    return NextResponse.json({ setupRequired: !exists });
  } catch (error) {
    console.error("Setup check error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to check setup status" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Lock out if admin already exists
    if (await adminExists()) {
      return NextResponse.json({ error: "Admin account already exists" }, { status: 409 });
    }

    const { name, email, password, companyPasskey } = await req.json();

    const expectedPasskey = process.env.ADMIN_PASSKEY;
    if (!expectedPasskey) {
      return NextResponse.json({ error: "ADMIN_PASSKEY not configured on server" }, { status: 500 });
    }
    if (!companyPasskey || !timingSafePasskeyEqual(companyPasskey, expectedPasskey)) {
      return NextResponse.json({ error: "Invalid company passkey" }, { status: 401 });
    }

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Upgrade existing user to admin instead of creating a duplicate
      const hashed = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { email },
        data: { role: "admin", password: hashed, active: true },
      });
    } else {
      const hashed = await bcrypt.hash(password, 12);
      await prisma.user.create({
        data: { name, email, password: hashed, role: "admin", active: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin setup error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to create admin account" }, { status: 500 });
  }
}
