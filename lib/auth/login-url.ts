import { ROUTES } from "@/constants/routes";

/**
 * Auth.js reserves the `error` query param on the sign-in page
 * (CredentialsSignin, OAuthCallback, etc.). Putting our own values there
 * (e.g. `error=stale_session`) breaks credential login for testers.
 *
 * Session recovery must land on a clean `/login`, optionally with `notice=`
 * which Auth.js ignores.
 */
export type LoginNotice =
  | "session_expired"
  | "account_restricted"
  | "signed_out";

export function loginUrl(options?: {
  notice?: LoginNotice;
  callbackUrl?: string;
}): string {
  const params = new URLSearchParams();

  if (options?.notice) {
    params.set("notice", options.notice);
  }

  if (options?.callbackUrl?.startsWith("/") && !options.callbackUrl.startsWith("//")) {
    params.set("callbackUrl", options.callbackUrl);
  }

  const query = params.toString();
  return query ? `${ROUTES.login}?${query}` : ROUTES.login;
}

/** Clear session then open a safe login URL (never use `error=`). */
export function logoutThenLoginUrl(notice?: LoginNotice): string {
  const to = loginUrl(notice ? { notice } : undefined);
  return `${ROUTES.logout}?to=${encodeURIComponent(to)}`;
}

export function getLoginNoticeMessage(notice: string | null): string | null {
  switch (notice) {
    case "session_expired":
      return "Your session ended. Sign in again to continue.";
    case "account_restricted":
      return "This account is restricted. Contact support if you believe this is a mistake.";
    case "signed_out":
      return "You have been signed out.";
    default:
      return null;
  }
}
