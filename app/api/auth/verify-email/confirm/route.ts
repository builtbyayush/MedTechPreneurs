import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getSessionUserId } from "@/lib/auth/session-user";
import { confirmEmailVerificationCode } from "@/lib/email/verification-code";
import { verifyEmailCodeSchema } from "@/lib/validations/email-verification";

export const POST = auth(async (request) => {
  try {
    const userId = getSessionUserId(request.auth);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = verifyEmailCodeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: parsed.error.issues[0]?.message ?? "Invalid code",
        },
        { status: 400 },
      );
    }

    const result = await confirmEmailVerificationCode(userId, parsed.data.code);

    if (!result.verified) {
      return NextResponse.json(
        { error: result.message ?? "Verification failed" },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, verified: true });
  } catch (error) {
    console.error("[verify-email/confirm/POST]", error);
    return NextResponse.json(
      { error: "Unable to verify email" },
      { status: 500 },
    );
  }
});
