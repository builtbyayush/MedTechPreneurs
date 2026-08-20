import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { resetRejectedDiscoveryProfiles } from "@/lib/discovery/queries";

/** PRD-compatible alias for restoring passed/rejected Discovery profiles. */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resetCount = await resetRejectedDiscoveryProfiles(session.user.id);

    return NextResponse.json({ ok: true, resetCount });
  } catch (error) {
    console.error("[swipe/reset-rejects/POST]", error);
    return NextResponse.json(
      { error: "Unable to reset passed founders" },
      { status: 500 },
    );
  }
}
