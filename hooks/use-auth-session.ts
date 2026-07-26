"use client";

import { useSession } from "next-auth/react";

/**
 * Client-side session hook for authenticated UI.
 * Prefer `auth()` in Server Components and Server Actions.
 */
export function useAuthSession() {
  const { data, status } = useSession();

  return {
    user: data?.user ?? null,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isUnauthenticated: status === "unauthenticated",
  };
}
