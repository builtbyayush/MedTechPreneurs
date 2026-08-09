import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { authorizePusherChannel } from "@/lib/pusher/auth";
import {
  realtimeServerLog,
  realtimeServerError,
} from "@/lib/pusher/realtime-log";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      realtimeServerError("Pusher auth failure", { reason: "unauthorized" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.text();
    const params = new URLSearchParams(body);
    const socketId = params.get("socket_id");
    const channelName = params.get("channel_name");

    if (!socketId || !channelName) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const result = await authorizePusherChannel({
      userId: session.user.id,
      channelName,
      socketId,
    });

    if (!result.ok) {
      realtimeServerError("Pusher auth failure", {
        userId: session.user.id,
        channel: channelName,
        reason: result.reason,
      });

      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    realtimeServerLog("Pusher auth success", {
      userId: session.user.id,
      channel: channelName,
    });

    return NextResponse.json(result.auth);
  } catch (error) {
    console.error("[pusher/auth]", error);
    return NextResponse.json(
      { error: "Unable to authorize channel" },
      { status: 500 },
    );
  }
}
