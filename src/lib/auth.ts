import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { isRateLimited } from "@/lib/rateLimit";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // H-8: rate-limit login attempts per email (10 attempts per 15 min)
        if (isRateLimited(`login:${credentials.email.toLowerCase()}`, 10, 15 * 60 * 1000)) {
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.passwordChangedAt = user.passwordChangedAt ?? 0;
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
