import nodemailer from "nodemailer";

import { getAppName, getSmtpFromAddress, isSmtpConfigured } from "@/config/email";

type SendVerificationCodeInput = {
  to: string;
  code: string;
};

export async function sendVerificationCode({
  to,
  code,
}: SendVerificationCodeInput): Promise<{ delivered: boolean; devCode?: string }> {
  const appName = getAppName();

  if (!isSmtpConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP is not configured");
    }

    console.info(
      `[email] Verification code for ${to}: ${code} (SMTP not configured — dev mode)`,
    );

    return { delivered: false, devCode: code };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    ...(process.env.SMTP_SECURE !== "true"
      ? { requireTLS: true }
      : {}),
  });

  await transporter.sendMail({
    from: getSmtpFromAddress(),
    to,
    subject: `${appName} — verify your email`,
    text: `Your ${appName} verification code is ${code}. It expires in 15 minutes.`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.5; color: #111;">
        <p>Your ${appName} verification code is:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 0.2em;">${code}</p>
        <p style="color: #555;">This code expires in 15 minutes. If you didn't request it, you can ignore this email.</p>
      </div>
    `,
  });

  return { delivered: true };
}
