import { getToken } from "next-auth/jwt";
import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret");

async function isValidAdminToken(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin portal routes
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    if (await isValidAdminToken(req)) return NextResponse.next();
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Public routes
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/api/auth")
  ) {
    if (token && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Protected routes — require auth
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Role-based access
  const role = token.role as string;

  if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/dashboard/manager") && role !== "manager" && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (
    pathname.startsWith("/dashboard/staff") &&
    role !== "it_staff" &&
    role !== "hr_staff"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/dashboard/create") && role !== "employee") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
