"use client";

import Pusher from "pusher-js";

import { getPusherClientOptions } from "@/lib/pusher/client-config";
import { realtimeLog, realtimeWarn } from "@/lib/pusher/realtime-log";

let pusherClient: Pusher | null = null;
let initPromise: Promise<Pusher | null> | null = null;

function getEmbeddedClientConfig(): { key: string; cluster: string } | null {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY?.trim();
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER?.trim();

  if (!key || !cluster) {
    return null;
  }

  return { key, cluster };
}

export function isPusherClientConfigured(): boolean {
  return getEmbeddedClientConfig() !== null;
}

export function getMissingPusherClientEnvVars(): string[] {
  const missing: string[] = [];

  if (!process.env.NEXT_PUBLIC_PUSHER_KEY?.trim()) {
    missing.push("NEXT_PUBLIC_PUSHER_KEY");
  }

  if (!process.env.NEXT_PUBLIC_PUSHER_CLUSTER?.trim()) {
    missing.push("NEXT_PUBLIC_PUSHER_CLUSTER");
  }

  return missing;
}

function bindConnectionLogs(client: Pusher): void {
  client.connection.bind(
    "state_change",
    (states: { current: string; previous: string }) => {
      realtimeLog(`connection state: ${states.current}`);
    },
  );
}

function createPusherClient(key: string, cluster: string): Pusher {
  const client = new Pusher(key, getPusherClientOptions(key, cluster));
  bindConnectionLogs(client);
  realtimeLog("Pusher client initialized", { cluster });
  return client;
}

async function fetchRuntimePusherConfig(): Promise<{
  key: string;
  cluster: string;
} | null> {
  try {
    const response = await fetch("/api/pusher/config", { cache: "no-store" });

    if (!response.ok) {
      realtimeWarn("runtime Pusher config fetch failed", {
        status: response.status,
      });
      return null;
    }

    const payload = (await response.json()) as {
      key?: string;
      cluster?: string;
    };

    if (!payload.key?.trim() || !payload.cluster?.trim()) {
      return null;
    }

    realtimeLog("runtime Pusher config loaded");
    return { key: payload.key.trim(), cluster: payload.cluster.trim() };
  } catch {
    realtimeWarn("runtime Pusher config fetch failed", { status: 0 });
    return null;
  }
}

/** Ensures a Pusher client exists — uses embedded env or runtime config API. */
export async function ensurePusherClient(): Promise<Pusher | null> {
  if (pusherClient) {
    return pusherClient;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const embedded = getEmbeddedClientConfig();
    const config = embedded ?? (await fetchRuntimePusherConfig());

    if (!config) {
      realtimeWarn("Pusher client not initialized", {
        missing: getMissingPusherClientEnvVars().join(", ") || "unknown",
        hint: "Set NEXT_PUBLIC_PUSHER_KEY or PUSHER_KEY in .env.local, then rebuild",
      });
      return null;
    }

    pusherClient = createPusherClient(config.key, config.cluster);
    return pusherClient;
  })();

  try {
    return await initPromise;
  } finally {
    initPromise = null;
  }
}

/** Sync accessor — returns client only if already initialized via ensurePusherClient. */
export function getPusherClient(): Pusher | null {
  return pusherClient;
}

export function disconnectPusherClient(): void {
  if (pusherClient) {
    pusherClient.disconnect();
    pusherClient = null;
  }
}
