import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createUserReport } from "@/lib/reports/queries";
import { createReportSchema } from "@/lib/validations/report";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const report = await createUserReport(session.user.id, {
      ...parsed.data,
      description: parsed.data.description || undefined,
    });

    return NextResponse.json({
      ok: true,
      report,
      message:
        "Report submitted. Our team will review it — admin review tooling arrives in a future release.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit report";

    console.error("[reports/POST]", error);

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
