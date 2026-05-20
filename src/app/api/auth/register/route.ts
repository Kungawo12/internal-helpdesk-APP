import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { isRateLimited } from "@/lib/rateLimit";
import { RegisterSchema, firstZodError } from "@/lib/schemas";

// C-1: role is always "employee" — privilege escalation via body is not possible
// H-7: password minimum raised to 10 characters
// M-13: duplicate-email response is generic to prevent email enumeration

function getClientIp(req: Request): string {
  // L3: only trust x-vercel-forwarded-for — set by Vercel's proxy and cannot be spoofed.
  // x-forwarded-for is user-controllable and dropped.
  return req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

// Dummy bcrypt used to equalise response timing when an email already exists (M2).
// Without this, an attacker can distinguish "email taken" from "created" by timing alone.
const DUMMY_HASH = "$2b$12$invalidhashpadding000000000000000000000000000000000000000";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (await isRateLimited(`register:${ip}`, 5, 15 * 60 * 1000)) {
      return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
    }
    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      // M2: run a dummy bcrypt to equalise timing — prevents enumeration via response time
      await bcrypt.compare(password, DUMMY_HASH).catch(() => {});
      return Response.json(
        { message: "Account created successfully" },
        { status: 201 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
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
