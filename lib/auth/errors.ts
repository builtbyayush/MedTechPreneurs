export const AUTH_ERROR_MESSAGES = {
  invalidCredentials: "Invalid email or password.",
  emailExists: "An account with this email already exists.",
  registrationFailed: "We couldn't create your account. Please try again.",
  signInFailed: "We couldn't sign you in. Please try again.",
  sessionExpired: "Your session has expired. Please sign in again.",
  generic: "Something went wrong. Please try again.",
} as const;

export type AuthErrorMessageKey = keyof typeof AUTH_ERROR_MESSAGES;

export function getAuthErrorMessage(
  error?: string | null,
  fallback: AuthErrorMessageKey = "generic",
): string {
  if (!error) {
    return AUTH_ERROR_MESSAGES[fallback];
  }

  const normalized = error.toLowerCase();

  if (
    normalized.includes("credentialssignin") ||
    normalized.includes("invalid_credentials")
  ) {
    return AUTH_ERROR_MESSAGES.invalidCredentials;
  }

  if (normalized.includes("session") && normalized.includes("expired")) {
    return AUTH_ERROR_MESSAGES.sessionExpired;
  }

  return AUTH_ERROR_MESSAGES[fallback];
}
