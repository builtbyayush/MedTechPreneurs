import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { markConversationMessagesRead } from "@/lib/messaging/queries";

type RouteContext = {
  params: Promise<{ conversationId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await context.params;
    const updated = await markConversationMessagesRead({
      conversationId,
      userId: session.user.id,
    });

    return NextResponse.json({ ok: true, updated });
  } catch (error) {
    console.error("[conversations/read/POST]", error);

    if (error instanceof Error && error.message === "Conversation not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Unable to mark messages as read" },
      { status: 500 },
    );
  }
}
