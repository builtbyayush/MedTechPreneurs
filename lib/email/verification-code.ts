import { compare, hash } from "bcryptjs";
import crypto from "node:crypto";

import { EMAIL_VERIFICATION } from "@/config/email";
import { connectDB } from "@/lib/db";
import { EmailVerificationCode } from "@/models/EmailVerificationCode";
import { User } from "@/models/User";

function generateNumericCode(): string {
  const max = 10 ** EMAIL_VERIFICATION.codeLength;
  const value = crypto.randomInt(0, max);
  return value.toString().padStart(EMAIL_VERIFICATION.codeLength, "0");
}

function getExpiryDate(): Date {
  return new Date(Date.now() + EMAIL_VERIFICATION.expiresMinutes * 60_000);
}

export async function getEmailVerificationStatus(userId: string): Promise<{
  emailVerified: boolean;
  email: string | null;
}> {
  await connectDB();

  const user = await User.findById(userId)
    .select("email emailVerified")
    .lean<{ email: string; emailVerified?: boolean } | null>();

  if (!user) {
    return { emailVerified: false, email: null };
  }

  return {
    emailVerified: Boolean(user.emailVerified),
    email: user.email,
  };
}

export async function issueEmailVerificationCode(userId: string): Promise<{
  email: string;
  cooldownSeconds: number;
  devCode?: string;
}> {
  await connectDB();

  const user = await User.findById(userId).select("email emailVerified").lean<{
    email: string;
    emailVerified?: boolean;
  } | null>();

  if (!user) {
    throw new Error("User not found");
  }

  if (user.emailVerified) {
    return { email: user.email, cooldownSeconds: 0 };
  }

  const existing = await EmailVerificationCode.findOne({ userId }).select(
    "lastSentAt",
  );

  if (existing?.lastSentAt) {
    const elapsedSeconds = Math.floor(
      (Date.now() - existing.lastSentAt.getTime()) / 1000,
    );
    const remaining = EMAIL_VERIFICATION.resendCooldownSeconds - elapsedSeconds;

    if (remaining > 0) {
      return { email: user.email, cooldownSeconds: remaining };
    }
  }

  const code = generateNumericCode();
  const codeHash = await hash(code, 10);
  const expiresAt = getExpiryDate();
  const lastSentAt = new Date();

  await EmailVerificationCode.findOneAndUpdate(
    { userId },
    {
      userId,
      codeHash,
      expiresAt,
      lastSentAt,
      attempts: 0,
    },
    { upsert: true, returnDocument: "after" },
  );

  const { sendVerificationCode } = await import("@/lib/email/send-verification-code");
  const result = await sendVerificationCode({ to: user.email, code });

  return {
    email: user.email,
    cooldownSeconds: EMAIL_VERIFICATION.resendCooldownSeconds,
    devCode: result.devCode,
  };
}

export async function confirmEmailVerificationCode(
  userId: string,
  code: string,
): Promise<{ verified: boolean; message?: string }> {
  await connectDB();

  const user = await User.findById(userId).select("emailVerified").lean<{
    emailVerified?: boolean;
  } | null>();

  if (!user) {
    return { verified: false, message: "User not found" };
  }

  if (user.emailVerified) {
    return { verified: true };
  }

  const record = await EmailVerificationCode.findOne({ userId }).select(
    "+codeHash expiresAt attempts",
  );

  if (!record) {
    return {
      verified: false,
      message: "No verification code found. Request a new one.",
    };
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await EmailVerificationCode.deleteOne({ userId });
    return {
      verified: false,
      message: "That code has expired. Request a new one.",
    };
  }

  if (record.attempts >= EMAIL_VERIFICATION.maxAttempts) {
    await EmailVerificationCode.deleteOne({ userId });
    return {
      verified: false,
      message: "Too many attempts. Request a new code.",
    };
  }

  const valid = await compare(code, record.codeHash);

  if (!valid) {
    record.attempts += 1;
    await record.save();
    return { verified: false, message: "Incorrect code. Try again." };
  }

  await User.findByIdAndUpdate(userId, { emailVerified: true });
  await EmailVerificationCode.deleteOne({ userId });

  return { verified: true };
}
