export const PASSWORD_RESET = {
  /** Reset link lifetime */
  expiresMinutes: 60,
  /** Minimum wait between reset emails for the same account */
  resendCooldownSeconds: 60,
  /** Entropy for the raw token sent by email (bytes before base64url encoding) */
  tokenBytes: 32,
} as const;

export const PASSWORD_RESET_MESSAGES = {
  requestSuccess:
    "If an account exists for this email, you'll receive instructions to reset your password.",
  requestCooldown: (seconds: number) =>
    `Please wait ${seconds}s before requesting another reset link.`,
  resetSuccess:
    "Your password has been reset. You can now sign in with your new password.",
  invalidToken:
    "This reset link is invalid or has expired. Request a new one from the sign-in page.",
  resetFailed: "We couldn't reset your password. Please try again.",
} as const;
