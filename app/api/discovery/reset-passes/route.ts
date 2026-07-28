import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { resetPassedFounders } from "@/lib/discovery/queries";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resetCount = await resetPassedFounders(session.user.id);

    return NextResponse.json({ ok: true, resetCount });
  } catch (error) {
    console.error("[discovery/reset-passes/POST]", error);
    return NextResponse.json(
      { error: "Unable to reset passed founders" },
      { status: 500 },
    );
  }
}
