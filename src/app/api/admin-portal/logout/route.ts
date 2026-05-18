import { NextResponse } from "next/server";

// M-11: legacy admin_token cookie removed — session is managed by NextAuth.
// Logout is handled by NextAuth's signOut on the client.

export async function POST() {
  return NextResponse.json({ success: true });
}
