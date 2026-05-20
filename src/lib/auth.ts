import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { isRateLimited } from "@/lib/rateLimit";

export const authOptions: AuthOptions = {
  providers: [
    // Google OAuth — allows sign-in with existing Google/Workspace accounts.
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
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "credentials") {
          // Credentials login — role and passwordChangedAt come from authorize()
          token.id = user.id;
          token.role = user.role;
          token.passwordChangedAt = user.passwordChangedAt ?? 0;
        } else {
          // OAuth login (e.g. Google) — fetch role from DB since NextAuth's
          // user object only has id/name/email from the provider
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true, active: true },
          });
          token.id = user.id;
          token.role = dbUser?.role ?? "employee";
          token.passwordChangedAt = 0; // OAuth users have no password
          if (!dbUser?.active) token.error = "AccountDeactivated";
        }
      } else if (token.id) {
        // On every JWT rotation, reject stale tokens after password reset or deactivation
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { active: true, passwordChangedAt: true },
        });
        if (!dbUser?.active) {
          token.error = "AccountDeactivated";
        } else {
          const dbChangedAt = dbUser.passwordChangedAt?.getTime() ?? 0;
          if (dbChangedAt > (token.passwordChangedAt ?? 0)) {
            token.error = "PasswordChanged";
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.error) {
        return { ...session, error: token.error };
      }
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    // M7: short-lived sessions for an internal helpdesk — forces re-auth every 8 hours
    maxAge: 8 * 60 * 60,
  },
  // M-15: SameSite=Strict prevents cross-site requests from carrying the session cookie
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "strict" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
