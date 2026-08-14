import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  AccountAccessError,
  requireAdmin,
} from "@/lib/auth/account";
import { listAdminReports, ReportError } from "@/lib/reports/queries";
import type { ReportStatus } from "@/constants/reports";

export async function GET(request: Request) {
  try {
    const session = await auth();
    await requireAdmin(session?.user?.id);

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const status: ReportStatus =
      statusParam === "reviewed" ? "reviewed" : "pending";
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "20");

    const result = await listAdminReports({
      status,
      page: Number.isFinite(page) ? page : 1,
      limit: Number.isFinite(limit) ? limit : 20,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[admin/reports/GET]", error);

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
      { error: "Unable to load reports" },
      { status: 500 },
    );
  }
}
