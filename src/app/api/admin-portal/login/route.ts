import { NextRequest, NextResponse } from "next/server";
import { signAdminToken, ADMIN_COOKIE_NAME } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  try {
    const { passkey } = await req.json();

    if (!passkey) {
      return NextResponse.json({ error: "Passkey required" }, { status: 400 });
    }

    const adminPasskey = process.env.ADMIN_PASSKEY;
    if (!adminPasskey) {
      console.error("ADMIN_PASSKEY not configured");
      return NextResponse.json({ error: "Admin access not configured" }, { status: 500 });
    }

    if (passkey !== adminPasskey) {
      return NextResponse.json({ error: "Invalid passkey" }, { status: 401 });
    }

    const token = await signAdminToken();

    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
