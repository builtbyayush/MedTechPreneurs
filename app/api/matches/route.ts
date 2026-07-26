import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getMatchedFoundersForUser } from "@/lib/matching/queries";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const matches = await getMatchedFoundersForUser(session.user.id);

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("[matches/GET]", error);
    return NextResponse.json(
      { error: "Unable to load matches" },
      { status: 500 },
    );
  }
}
