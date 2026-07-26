"use client";

import { useEffect, useRef } from "react";

import { MESSAGING_POLL_INTERVAL_MS } from "@/lib/messaging/constants";

type UseMessagingPollOptions = {
  enabled?: boolean;
  intervalMs?: number;
};

/**
 * Polls messaging endpoints on an interval.
 * Replace the callback body with a WebSocket subscription later without changing call sites.
 */
export function useMessagingPoll(
  callback: () => void | Promise<void>,
  options: UseMessagingPollOptions = {},
) {
  const { enabled = true, intervalMs = MESSAGING_POLL_INTERVAL_MS } = options;
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const tick = () => {
      void callbackRef.current();
    };

    const intervalId = window.setInterval(tick, intervalMs);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, intervalMs]);
}
