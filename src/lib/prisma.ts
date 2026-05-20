import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Always store the singleton on globalThis — not just in dev.
// In production, Vercel warm instances share the module cache, but
// re-evaluations (e.g. after a hot path reload) would create a second
// PrismaClient and leak a connection slot without this guard.
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma;
