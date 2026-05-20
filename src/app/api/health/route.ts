import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// L7: admin-only — prevents leaking DB connectivity status and env flags to the public
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checks = {
    database: false,
    databaseUrl: !!process.env.DATABASE_URL,
    directUrl: !!process.env.DIRECT_URL,
    nextauthSecret: !!process.env.NEXTAUTH_SECRET,
    nextauthUrl: !!process.env.NEXTAUTH_URL, // L7: boolean only — never expose the value
    error: null as string | null,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {
    // L7: generic message — raw DB errors must not reach the client
    checks.error = "Database connectivity check failed";
  }

  return Response.json(checks);
}
