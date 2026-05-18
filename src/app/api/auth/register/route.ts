import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { isRateLimited } from "@/lib/rateLimit";

// C-1: role is always "employee" — privilege escalation via body is not possible
// H-7: password minimum raised to 10 characters
// M-13: duplicate-email response is generic to prevent email enumeration
// M-16: prefer x-vercel-forwarded-for (not spoofable behind Vercel's proxy)

function getClientIp(req: Request): string {
  return (
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(`register:${ip}`, 5, 15 * 60 * 1000)) {
      return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ error: "All fields are required" }, { status: 400 });
    }

    if (name.trim().length < 2) {
      return Response.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    if (password.length < 10) {
      return Response.json({ error: "Password must be at least 10 characters" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Return generic message regardless of whether email exists (M-13)
    if (existingUser) {
      return Response.json(
        { message: "Account created successfully" },
        { status: 201 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "employee", // C-1: always employee, never trust client-supplied role
      },
    });

    return Response.json(
      { message: "Account created successfully" },
      { status: 201 }
    );
  } catch {
    return Response.json(
      { error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
