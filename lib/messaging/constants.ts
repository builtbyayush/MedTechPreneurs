/** Polling interval for messaging — swap for WebSockets later without changing consumers. */
export const MESSAGING_POLL_INTERVAL_MS = 15_000;

export const MESSAGE_CONTENT_MAX_LENGTH = 2000;

/** Prevent duplicate rapid submissions (client + server). */
export const MESSAGE_DUPLICATE_WINDOW_MS = 2_000;
