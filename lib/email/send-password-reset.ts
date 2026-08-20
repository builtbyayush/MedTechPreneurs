import nodemailer from "nodemailer";

import { PASSWORD_RESET } from "@/config/password-reset";
import { getAppName, getSmtpFromAddress, isSmtpConfigured } from "@/config/email";
import { siteConfig } from "@/config/site";

type SendPasswordResetInput = {
  to: string;
  resetUrl: string;
};

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: SendPasswordResetInput): Promise<{ delivered: boolean; devResetUrl?: string }> {
  const appName = getAppName();
  const expiresLabel =
    PASSWORD_RESET.expiresMinutes === 60
      ? "1 hour"
      : `${PASSWORD_RESET.expiresMinutes} minutes`;

  if (!isSmtpConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP is not configured");
    }

    console.info(
      `[email] Password reset link for ${to}: ${resetUrl} (SMTP not configured — dev mode)`,
    );

    return { delivered: false, devResetUrl: resetUrl };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    ...(process.env.SMTP_SECURE !== "true" ? { requireTLS: true } : {}),
  });

  await transporter.sendMail({
    from: getSmtpFromAddress(),
    to,
    subject: `${appName} — reset your password`,
    text: `Reset your ${appName} password by opening this link (expires in ${expiresLabel}):\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.5; color: #111;">
        <p>We received a request to reset your ${appName} password.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 20px; background: #0E7C7B; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700;">
            Reset password
          </a>
        </p>
        <p style="color: #555;">This link expires in ${expiresLabel}. If you didn't request it, you can ignore this email.</p>
        <p style="color: #888; font-size: 12px; word-break: break-all;">${resetUrl}</p>
      </div>
    `,
  });

  return { delivered: true };
}

export function buildPasswordResetUrl(token: string): string {
  const url = new URL("/reset-password", siteConfig.url);
  url.searchParams.set("token", token);
  return url.toString();
}
