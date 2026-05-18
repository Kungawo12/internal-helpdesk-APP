import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET environment variable is not set");
}

/** Returns true if the current request has an active admin session. */
export async function isAdminRequest(_req: NextRequest): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin" && !session.error;
}

/** Use in route handlers that have a standard Request (not NextRequest) */
export async function isAdminServerSide(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin" && !session.error;
}
