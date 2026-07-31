import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  getEmailVerificationStatus,
  issueEmailVerificationCode,
} from "@/lib/email/verification-code";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = await getEmailVerificationStatus(session.user.id);

    return NextResponse.json(status);
  } catch (error) {
    console.error("[verify-email/GET]", error);
    return NextResponse.json(
      { error: "Unable to check verification status" },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await issueEmailVerificationCode(session.user.id);

    if (result.cooldownSeconds > 0 && !result.devCode) {
      return NextResponse.json(
        {
          ok: false,
          message: `Please wait ${result.cooldownSeconds}s before requesting another code.`,
          cooldownSeconds: result.cooldownSeconds,
          email: result.email,
        },
        { status: 429 },
      );
    }

    return NextResponse.json({
      ok: true,
      email: result.email,
      cooldownSeconds: result.cooldownSeconds,
      ...(process.env.NODE_ENV !== "production" && result.devCode
        ? { devCode: result.devCode }
        : {}),
    });
  } catch (error) {
    console.error("[verify-email/POST]", error);
    return NextResponse.json(
      { error: "Unable to send verification code" },
      { status: 500 },
    );
  }
}
