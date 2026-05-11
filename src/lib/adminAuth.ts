import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret");
const COOKIE_NAME = "admin_token";

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ isAdmin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function getAdminTokenFromRequest(req: NextRequest): Promise<string | undefined> {
  return req.cookies.get(COOKIE_NAME)?.value;
}

/** Accepts either: legacy admin_token cookie OR NextAuth session with role=admin */
export async function isAdminRequest(req: NextRequest): Promise<boolean> {
  // Check NextAuth session first (primary)
  const session = await getServerSession(authOptions);
  if (session?.user?.role === "admin") return true;

  // Fallback: legacy admin_token cookie
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token) return verifyAdminToken(token);

  return false;
}

export { COOKIE_NAME as ADMIN_COOKIE_NAME };

/** Use in route handlers that have a standard Request (not NextRequest) */
export async function isAdminServerSide(): Promise<boolean> {
  // Check NextAuth session first (primary)
  const session = await getServerSession(authOptions);
  if (session?.user?.role === "admin") return true;

  // Fallback: legacy admin_token cookie
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) return verifyAdminToken(token);

  return false;
}
