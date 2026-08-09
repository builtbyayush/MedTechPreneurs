import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { realtimeServerLog } from "@/lib/pusher/realtime-log";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key =
    process.env.NEXT_PUBLIC_PUSHER_KEY?.trim() ||
    process.env.PUSHER_KEY?.trim();
  const cluster =
    process.env.NEXT_PUBLIC_PUSHER_CLUSTER?.trim() ||
    process.env.PUSHER_CLUSTER?.trim();

  if (!key || !cluster) {
    realtimeServerLog("Pusher config unavailable for client");
    return NextResponse.json(
      { error: "Pusher is not configured" },
      { status: 503 },
    );
  }

  return NextResponse.json({ key, cluster });
}
