import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { getDemoUserByCredentials } from "@/lib/demo-mode";
import { prisma } from "@/lib/prisma";

const authSecret =
  process.env.AUTH_SECRET ??
  (process.env.NODE_ENV === "development" ? "ponchocapital-dev-secret-change-me" : undefined);

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: authSecret,
  trustHost: process.env.AUTH_TRUST_HOST === "true",
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {}
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: parsed.data.email },
            include: {
              client: true
            }
          });

          if (!user) {
            return process.env.NODE_ENV !== "production"
              ? getDemoUserByCredentials(parsed.data.email, parsed.data.password)
              : null;
          }

          const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);

          if (!isValid || user.status !== "ACTIVE") {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            clientId: user.client?.id ?? null
          };
        } catch {
          if (process.env.NODE_ENV !== "production") {
            return getDemoUserByCredentials(parsed.data.email, parsed.data.password);
          }

          return null;
        }
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.clientId = user.clientId;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as typeof session.user.role;
        session.user.clientId = (token.clientId as string | null | undefined) ?? null;
      }

      return session;
    }
  }
});
