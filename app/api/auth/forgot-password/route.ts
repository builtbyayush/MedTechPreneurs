import { NextResponse } from "next/server";

import { PASSWORD_RESET_MESSAGES } from "@/config/password-reset";
import { requestPasswordReset } from "@/lib/password-reset/service";
import { forgotPasswordSchema } from "@/lib/validations/password-reset";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Validation failed",
          message: parsed.error.issues[0]?.message ?? "Invalid email address",
        },
        { status: 400 },
      );
    }

    const result = await requestPasswordReset(parsed.data.email);

    if (result.cooldownSeconds && result.cooldownSeconds > 0) {
      return NextResponse.json(
        {
          ok: false,
          message: result.message,
          cooldownSeconds: result.cooldownSeconds,
        },
        { status: 429 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: PASSWORD_RESET_MESSAGES.requestSuccess,
      ...(process.env.NODE_ENV !== "production" && result.devResetUrl
        ? { devResetUrl: result.devResetUrl }
        : {}),
    });
  } catch (error) {
    console.error("[auth/forgot-password]", error);
    return NextResponse.json(
      {
        ok: false,
        message: PASSWORD_RESET_MESSAGES.requestSuccess,
      },
      { status: 500 },
    );
  }
}
