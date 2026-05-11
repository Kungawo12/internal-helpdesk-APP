import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

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

export async function isAdminRequest(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}

export { COOKIE_NAME as ADMIN_COOKIE_NAME };

/** Use in route handlers that have a standard Request (not NextRequest) */
export async function isAdminServerSide(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}
