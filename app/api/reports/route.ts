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
import { createReportLegacySchema } from "@/lib/validations/report";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await assertActiveAccount(session.user.id);

    const body = await request.json();
    const parsed = createReportLegacySchema.safeParse(body);

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
      parsed.data.reportedUserId,
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
    console.error("[reports/POST]", error);

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
