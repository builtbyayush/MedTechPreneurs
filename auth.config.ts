import type { NextAuthConfig } from "next-auth";

import { AUTH_ROUTES, SESSION_MAX_AGE } from "@/config/auth";
import type { UserRole } from "@/constants/roles";

/**
 * Edge-safe Auth.js config — no providers that import Node-only APIs.
 * Used by middleware; full providers are added in auth.ts.
 */
export const authConfig = {
  providers: [],
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE.remembered,
  },
  pages: {
    signIn: AUTH_ROUTES.signIn,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: UserRole }).role ?? "user";
        const sessionMaxAge =
          (user as { sessionMaxAge?: number }).sessionMaxAge ??
          SESSION_MAX_AGE.default;
        token.exp = Math.floor(Date.now() / 1000) + sessionMaxAge;
      }

      // Preserve identity across refreshes when older tokens only populated `sub`.
      if (!token.id && typeof token.sub === "string") {
        token.id = token.sub;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const userId =
          (typeof token.id === "string" && token.id) ||
          (typeof token.sub === "string" && token.sub) ||
          undefined;

        if (userId) {
          session.user.id = userId;
        }

        session.user.role = (token.role as UserRole | undefined) ?? "user";
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
