import { ROUTES } from "@/constants/routes";

export const AUTH_ROUTES = {
  signIn: ROUTES.login,
  signUp: ROUTES.register,
  signOut: ROUTES.logout,
  defaultCallback: ROUTES.app.home,
} as const;

/** Session lifetime in seconds */
export const SESSION_MAX_AGE = {
  default: 24 * 60 * 60,
  remembered: 30 * 24 * 60 * 60,
} as const;

/** Provider IDs — add OAuth/OTP providers alongside credentials later */
export const AUTH_PROVIDER_IDS = {
  credentials: "credentials",
  google: "google",
  linkedin: "linkedin",
  emailOtp: "email-otp",
} as const;

export type AuthProviderId =
  (typeof AUTH_PROVIDER_IDS)[keyof typeof AUTH_PROVIDER_IDS];

/**
 * Routes accessible without authentication.
 * API auth handlers and static assets are excluded via middleware matcher.
 */
export const PUBLIC_ROUTES = [
  ROUTES.home,
  ROUTES.login,
  ROUTES.register,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
  ROUTES.offline,
  ROUTES.logout,
  ROUTES.terms,
  ROUTES.privacy,
  ROUTES.cookies,
] as const;

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
