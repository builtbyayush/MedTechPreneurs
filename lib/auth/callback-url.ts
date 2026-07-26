import { AUTH_ROUTES } from "@/config/auth";

/**
 * Restrict post-login redirects to same-origin relative paths.
 */
export function getSafeCallbackUrl(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return AUTH_ROUTES.defaultCallback;
  }

  return raw;
}
