import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  AccountAccessError,
  requireAdmin,
} from "@/lib/auth/account";
import {
  getAdminReportDetail,
  ReportError,
  reviewReport,
} from "@/lib/reports/queries";
import { reviewReportSchema } from "@/lib/validations/report";

type RouteContext = {
  params: Promise<{ reportId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    await requireAdmin(session?.user?.id);

    const { reportId } = await context.params;
    const detail = await getAdminReportDetail(reportId);

    return NextResponse.json(detail);
  } catch (error) {
    console.error("[admin/reports/GET:id]", error);

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

    return NextResponse.json(
      { error: "Unable to load report" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const admin = await requireAdmin(session?.user?.id);

    const { reportId } = await context.params;
    const body = await request.json();
    const parsed = reviewReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: parsed.error.issues[0]?.message ?? "Invalid review",
        },
        { status: 400 },
      );
    }

    const report = await reviewReport({
      reportId,
      adminId: admin.id,
      review: {
        action: parsed.data.action,
        adminNotes: parsed.data.adminNotes || undefined,
        suspensionDuration: parsed.data.suspensionDuration,
      },
    });

    return NextResponse.json({
      ok: true,
      report,
      message: "Moderation action recorded.",
    });
  } catch (error) {
    console.error("[admin/reports/PATCH]", error);

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

    return NextResponse.json(
      { error: "Unable to review report" },
      { status: 500 },
    );
  }
}
