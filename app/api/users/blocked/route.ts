import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getBlockedUsersForBlocker } from "@/lib/blocks/queries";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const blockedUsers = await getBlockedUsersForBlocker(session.user.id);

    return NextResponse.json({ blockedUsers });
  } catch (error) {
    console.error("[users/blocked/GET]", error);

    return NextResponse.json(
      { error: "Unable to load blocked users" },
      { status: 500 },
    );
  }
}
