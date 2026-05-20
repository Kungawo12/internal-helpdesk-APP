import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET environment variable is not set");
}

/**
 * Generate a cryptographically random base64 nonce for CSP.
 * A fresh nonce every request means an attacker can't pre-compute it.
 */
function generateNonce(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64");
}

/**
 * Build the Content-Security-Policy header value.
 *
 * 'nonce-{nonce}' replaces 'unsafe-inline' for scripts:
 *   - Next.js reads the nonce from the CSP response header
 *     (via getScriptNonceFromHeader) and stamps it on its own hydration scripts.
 *   - next-themes ThemeProvider accepts a `nonce` prop and stamps it on its
 *     inline script — the layout reads it from the x-nonce request header.
 *
 * 'strict-dynamic' propagates trust to scripts loaded by a nonce'd script
 * (how Next.js's module loader works), eliminating the need for an
 * allowlist of trusted script URLs.
 *
 * 'unsafe-eval' is included in development only — Next.js's hot-reload
 * uses eval(); removing it in production tightens the policy.
 */
function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https:",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const nonce = generateNonce();
  const csp = buildCsp(nonce);

  /**
   * Pass the nonce on the request so Server Components can read it:
   *   headers().get("x-nonce")        ← for ThemeProvider, etc.
   *   headers()["content-security-policy"] ← Next.js reads this to stamp
   *                                          its own hydration scripts
   */
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  /** Wrap NextResponse.next() so it always carries the nonce + CSP. */
  function passthrough() {
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    res.headers.set("Content-Security-Policy", csp);
    return res;
  }

  function redirectTo(url: string) {
    // Redirects don't render HTML — no need for CSP on them
    return NextResponse.redirect(new URL(url, req.url));
  }

  // ---------------------------------------------------------------------------
  // Admin portal routes
  // ---------------------------------------------------------------------------
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login" || pathname === "/admin/setup") return passthrough();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token?.role === "admin" && !token.error) return passthrough();
    return redirectTo("/login");
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // ---------------------------------------------------------------------------
  // Public routes
  // ---------------------------------------------------------------------------
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/api/auth")
  ) {
    if (token && (pathname === "/login" || pathname === "/register")) {
      return redirectTo("/dashboard");
    }
    return passthrough();
  }

  // ---------------------------------------------------------------------------
  // Protected routes — require auth and a valid (non-errored) token
  // ---------------------------------------------------------------------------
  if (!token || token.error) {
    return redirectTo("/login");
  }

  const role = token.role as string;

  if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
    return redirectTo("/dashboard");
  }

  // M3: managers must be able to access their own dashboard
  if (pathname.startsWith("/dashboard/manager") && role !== "manager" && role !== "admin") {
    return redirectTo("/dashboard");
  }

  // ai_staff handles Software tickets — they belong on the staff dashboard
  if (
    pathname.startsWith("/dashboard/staff") &&
    role !== "it_staff" &&
    role !== "hr_staff" &&
    role !== "ai_staff"
  ) {
    return redirectTo("/dashboard");
  }

  if (pathname.startsWith("/dashboard/create") && role !== "employee") {
    return redirectTo("/dashboard");
  }

  return passthrough();
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
