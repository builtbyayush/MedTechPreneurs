/** Polling interval for messaging — fallback when Pusher is unavailable. */
export const MESSAGING_POLL_INTERVAL_MS = 15_000;

/** Poll as a fallback for unread sync + missed realtime events. Set to "false" to disable. */
export const MESSAGING_POLL_ENABLED =
  process.env.NEXT_PUBLIC_MESSAGING_POLL_ENABLED !== "false";

export const MESSAGE_CONTENT_MAX_LENGTH = 2000;

/** Prevent duplicate rapid submissions (client + server). */
export const MESSAGE_DUPLICATE_WINDOW_MS = 2_000;
