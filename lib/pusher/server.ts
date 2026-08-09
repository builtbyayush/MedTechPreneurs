import "server-only";

import Pusher from "pusher";

import { pusherDevWarn } from "@/lib/pusher/debug";

let pusherServer: Pusher | null = null;

export function getMissingPusherServerEnvVars(): string[] {
  const missing: string[] = [];

  if (!process.env.PUSHER_APP_ID?.trim()) {
    missing.push("PUSHER_APP_ID");
  }

  if (!process.env.PUSHER_KEY?.trim()) {
    missing.push("PUSHER_KEY");
  }

  if (!process.env.PUSHER_SECRET?.trim()) {
    missing.push("PUSHER_SECRET");
  }

  if (!process.env.PUSHER_CLUSTER?.trim()) {
    missing.push("PUSHER_CLUSTER");
  }

  return missing;
}

export function isPusherConfigured(): boolean {
  return getMissingPusherServerEnvVars().length === 0;
}

export function getPusherServer(): Pusher | null {
  if (!isPusherConfigured()) {
    pusherDevWarn("Server not configured", {
      missing: getMissingPusherServerEnvVars().join(", "),
    });
    return null;
  }

  if (!pusherServer) {
    pusherServer = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true,
    });
  }

  return pusherServer;
}
