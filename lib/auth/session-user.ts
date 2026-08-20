import type { Session } from "next-auth";

/** Resolve the authenticated user id from an Auth.js session. */
export function getSessionUserId(session: Session | null | undefined): string | null {
  const user = session?.user;
  if (!user) {
    return null;
  }

  if (typeof user.id === "string" && user.id.length > 0) {
    return user.id;
  }

  return null;
}
