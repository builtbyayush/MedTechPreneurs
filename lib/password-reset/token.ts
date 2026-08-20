import crypto from "node:crypto";

import { PASSWORD_RESET } from "@/config/password-reset";

export function generateResetToken(): string {
  return crypto.randomBytes(PASSWORD_RESET.tokenBytes).toString("base64url");
}

/** SHA-256 lookup hash — raw tokens are never stored. */
export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getResetTokenExpiryDate(): Date {
  return new Date(Date.now() + PASSWORD_RESET.expiresMinutes * 60_000);
}
