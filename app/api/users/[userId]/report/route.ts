import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  AccountAccessError,
  assertActiveAccount,
} from "@/lib/auth/account";
import {
  createUserReportWithBlock,
  ReportError,
} from "@/lib/reports/queries";
import { createReportSchema } from "@/lib/validations/report";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await assertActiveAccount(session.user.id);

    const { userId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Reported user not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = createReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: parsed.error.issues[0]?.message ?? "Invalid report",
        },
        { status: 400 },
      );
    }

    const report = await createUserReportWithBlock(
      session.user.id,
      userId,
      {
        reason: parsed.data.reason,
        description: parsed.data.description || undefined,
      },
    );

    return NextResponse.json({
      ok: true,
      report,
      message: "Report submitted. Our team will review it.",
    });
  } catch (error) {
    console.error("[users/report/POST]", error);

    if (error instanceof AccountAccessError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    if (error instanceof ReportError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    const message =
      error instanceof Error ? error.message : "Unable to submit report";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
