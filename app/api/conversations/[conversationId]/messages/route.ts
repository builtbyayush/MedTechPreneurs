import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  getMessagesForConversation,
  sendMessage,
} from "@/lib/messaging/queries";
import { sendMessageSchema } from "@/lib/validations/messages";

type RouteContext = {
  params: Promise<{ conversationId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await context.params;
    const result = await getMessagesForConversation({
      conversationId,
      userId: session.user.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[conversations/messages/GET]", error);

    if (error instanceof Error && error.message === "Conversation not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Unable to load messages" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = sendMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: parsed.error.issues[0]?.message ?? "Invalid message",
        },
        { status: 400 },
      );
    }

    const { conversationId } = await context.params;
    const message = await sendMessage({
      conversationId,
      userId: session.user.id,
      content: parsed.data.content,
    });

    return NextResponse.json({ ok: true, message });
  } catch (error) {
    console.error("[conversations/messages/POST]", error);

    if (error instanceof Error) {
      if (error.message === "Conversation not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      if (
        error.message === "Message cannot be empty" ||
        error.message === "Please wait before sending the same message again"
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Unable to send message" },
      { status: 500 },
    );
  }
}
