import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  IntroductionError,
  sendIntroduction,
} from "@/lib/matching/intro";
import { sendIntroductionSchema } from "@/lib/validations/intro";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = sendIntroductionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: parsed.error.issues[0]?.message ?? "Invalid introduction",
        },
        { status: 400 },
      );
    }

    const result = await sendIntroduction({
      viewerId: session.user.id,
      targetUserId: parsed.data.targetUserId,
      content: parsed.data.content,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[matches/intro/POST]", error);

    if (error instanceof IntroductionError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Unable to send introduction" },
      { status: 500 },
    );
  }
}
