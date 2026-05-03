import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks = {
    database: false,
    databaseUrl: !!process.env.DATABASE_URL,
    directUrl: !!process.env.DIRECT_URL,
    nextauthSecret: !!process.env.NEXTAUTH_SECRET,
    nextauthUrl: process.env.NEXTAUTH_URL || "NOT SET",
    error: null as string | null,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (e) {
    checks.error = e instanceof Error ? e.message : "Unknown database error";
  }

  return Response.json(checks);
}
