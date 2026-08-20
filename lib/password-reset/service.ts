import { hash } from "bcryptjs";
import type { Types } from "mongoose";

import {
  PASSWORD_RESET,
  PASSWORD_RESET_MESSAGES,
} from "@/config/password-reset";
import {
  buildPasswordResetUrl,
  sendPasswordResetEmail,
} from "@/lib/email/send-password-reset";
import { connectDB } from "@/lib/db";
import {
  generateResetToken,
  getResetTokenExpiryDate,
  hashResetToken,
} from "@/lib/password-reset/token";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import { User } from "@/models/User";

export type RequestPasswordResetResult = {
  ok: true;
  message: string;
  cooldownSeconds?: number;
  devResetUrl?: string;
};

export async function requestPasswordReset(
  email: string,
): Promise<RequestPasswordResetResult> {
  await connectDB();

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail })
    .select("+passwordHash authProvider")
    .lean<{ _id: Types.ObjectId; passwordHash?: string } | null>();

  if (!user?.passwordHash) {
    return {
      ok: true,
      message: PASSWORD_RESET_MESSAGES.requestSuccess,
    };
  }

  const existing = await PasswordResetToken.findOne({
    userId: user._id,
  }).select("lastSentAt");

  if (existing?.lastSentAt) {
    const elapsedSeconds = Math.floor(
      (Date.now() - existing.lastSentAt.getTime()) / 1000,
    );
    const remaining =
      PASSWORD_RESET.resendCooldownSeconds - elapsedSeconds;

    if (remaining > 0) {
      return {
        ok: true,
        message: PASSWORD_RESET_MESSAGES.requestCooldown(remaining),
        cooldownSeconds: remaining,
      };
    }
  }

  const rawToken = generateResetToken();
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = getResetTokenExpiryDate();
  const lastSentAt = new Date();

  await PasswordResetToken.findOneAndUpdate(
    { userId: user._id },
    {
      userId: user._id,
      tokenHash,
      expiresAt,
      lastSentAt,
      usedAt: null,
    },
    { upsert: true, returnDocument: "after" },
  );

  const resetUrl = buildPasswordResetUrl(rawToken);
  const emailResult = await sendPasswordResetEmail({
    to: normalizedEmail,
    resetUrl,
  });

  return {
    ok: true,
    message: PASSWORD_RESET_MESSAGES.requestSuccess,
    ...(process.env.NODE_ENV !== "production" && emailResult.devResetUrl
      ? { devResetUrl: emailResult.devResetUrl }
      : {}),
  };
}

export type ValidateResetTokenResult =
  | { valid: true }
  | { valid: false; reason: "invalid" | "expired" | "used" };

export async function validateResetToken(
  token: string,
): Promise<ValidateResetTokenResult> {
  if (!token.trim()) {
    return { valid: false, reason: "invalid" };
  }

  await connectDB();

  const tokenHash = hashResetToken(token.trim());
  const record = await PasswordResetToken.findOne({ tokenHash }).select(
    "expiresAt usedAt",
  );

  if (!record) {
    return { valid: false, reason: "invalid" };
  }

  if (record.usedAt) {
    return { valid: false, reason: "used" };
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await PasswordResetToken.deleteOne({ tokenHash });
    return { valid: false, reason: "expired" };
  }

  return { valid: true };
}

export type ResetPasswordResult =
  | { ok: true; message: string }
  | { ok: false; error: string; status: 400 | 500 };

export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
): Promise<ResetPasswordResult> {
  const trimmedToken = token.trim();

  if (!trimmedToken) {
    return {
      ok: false,
      error: PASSWORD_RESET_MESSAGES.invalidToken,
      status: 400,
    };
  }

  await connectDB();

  const tokenHash = hashResetToken(trimmedToken);
  const record = await PasswordResetToken.findOne({ tokenHash }).select(
    "userId expiresAt usedAt",
  );

  if (!record) {
    return {
      ok: false,
      error: PASSWORD_RESET_MESSAGES.invalidToken,
      status: 400,
    };
  }

  if (record.usedAt) {
    return {
      ok: false,
      error: PASSWORD_RESET_MESSAGES.invalidToken,
      status: 400,
    };
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await PasswordResetToken.deleteOne({ tokenHash });
    return {
      ok: false,
      error: PASSWORD_RESET_MESSAGES.invalidToken,
      status: 400,
    };
  }

  const passwordHash = await hash(newPassword, 12);

  await User.findByIdAndUpdate(record.userId, { passwordHash });
  await PasswordResetToken.deleteOne({ tokenHash });

  return {
    ok: true,
    message: PASSWORD_RESET_MESSAGES.resetSuccess,
  };
}
