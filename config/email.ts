export const EMAIL_VERIFICATION = {
  codeLength: 6,
  expiresMinutes: 15,
  resendCooldownSeconds: 60,
  maxAttempts: 5,
} as const;

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS,
  );
}

export function getSmtpFromAddress(): string {
  return (
    process.env.SMTP_FROM?.trim() ||
    process.env.SMTP_USER?.trim() ||
    "noreply@splice.dev"
  );
}

export function getAppName(): string {
  return process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Splice+";
}
