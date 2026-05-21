import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { isRateLimited } from "@/lib/rateLimit";

export const authOptions: AuthOptions = {
  providers: [
    // Google OAuth -- allows sign-in with existing Google/Workspace accounts.
    // Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment.
    // New Google users are created with the default 'employee' role; an admin
    // can promote them afterwards in the admin portal.
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        // H-8: rate-limit by IP (broad) AND email (targeted).
        // req.headers is a plain Record<string, string> in NextAuth v4 authorize callbacks.
        const rawIp = (req?.headers as Record<string, string> | undefined)?.["x-vercel-forwarded-for"];
        const ip = rawIp?.split(",")[0]?.trim() ?? "unknown";

        if (await isRateLimited(`login:ip:${ip}`, 20, 15 * 60 * 1000)) {
          throw new Error("Too many login attempts. Please try again later.");
        }
        if (await isRateLimited(`login:${credentials.email.toLowerCase()}`, 10, 15 * 60 * 1000)) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;
        if (!user.active) return null;
        if (!user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          passwordChangedAt: user.passwordChangedAt?.getTime() ?? 0,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Google sign-in: upsert user with default employee role
      if (account?.provider === "google") {
        const existing = await prisma.user.findUnique({ where: { email: user.email! } });
        if (!existing) {
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name ?? user.email!,
              role: "employee",
            },
          });
        } else if (!existing.active) {
          return false; // block deactivated Google accounts
        }
      }
      return true;
    },

    // H-1 fix: re-validate passwordChangedAt on every JWT refresh.
    // If the user changed their password (or was deactivated) after the JWT was
    // issued, return null to force a new sign-in and clear the stale session.
    async jwt({ token }) {
      if (token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { passwordChangedAt: true, active: true, role: true },
          });
          // Reject token if user is deactivated
          if (!dbUser?.active) return null as unknown as typeof token;
          // Reject token if password was changed after this token was issued
          const tokenPwAt = (token.passwordChangedAt as number) ?? 0;
          const dbPwAt = dbUser.passwordChangedAt?.getTime() ?? 0;
          if (dbPwAt > tokenPwAt) return null as unknown as typeof token;
          // Keep role in sync with DB (catches role changes without re-login)
          token.role = dbUser.role;
        } catch {
          // If DB is unavailable, keep the existing token -- fail open to avoid
          // locking out users during transient DB connectivity issues.
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.passwordChangedAt = token.passwordChangedAt as number ?? 0;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },
};
