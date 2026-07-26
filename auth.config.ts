import type { NextAuthConfig } from "next-auth";

import { AUTH_ROUTES, SESSION_MAX_AGE } from "@/config/auth";

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
        const sessionMaxAge =
          (user as { sessionMaxAge?: number }).sessionMaxAge ??
          SESSION_MAX_AGE.default;
        token.exp = Math.floor(Date.now() / 1000) + sessionMaxAge;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
