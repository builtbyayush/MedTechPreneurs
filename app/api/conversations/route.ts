import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getConversationsForUser } from "@/lib/messaging/queries";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await getConversationsForUser(session.user.id);

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("[conversations/GET]", error);
    return NextResponse.json(
      { error: "Unable to load conversations" },
      { status: 500 },
    );
  }
}
