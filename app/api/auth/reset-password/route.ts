import { NextResponse } from "next/server";

import { PASSWORD_RESET_MESSAGES } from "@/config/password-reset";
import {
  resetPasswordWithToken,
  validateResetToken,
} from "@/lib/password-reset/service";
import { resetPasswordSchema } from "@/lib/validations/password-reset";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") ?? "";

    const result = await validateResetToken(token);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[auth/reset-password/GET]", error);
    return NextResponse.json({ valid: false, reason: "invalid" });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Validation failed",
          message: parsed.error.issues[0]?.message ?? "Invalid reset data",
        },
        { status: 400 },
      );
    }

    const result = await resetPasswordWithToken(
      parsed.data.token,
      parsed.data.password,
    );

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({
      ok: true,
      message: PASSWORD_RESET_MESSAGES.resetSuccess,
    });
  } catch (error) {
    console.error("[auth/reset-password/POST]", error);
    return NextResponse.json(
      { ok: false, message: PASSWORD_RESET_MESSAGES.resetFailed },
      { status: 500 },
    );
  }
}
