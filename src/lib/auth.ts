import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
  secret: process.env.NEXTAUTH_SECRET,
};
