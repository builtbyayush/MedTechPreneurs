/** Enable verbose [REALTIME] tracing in server logs and browser console. */
export function isRealtimeDebugEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.REALTIME_DEBUG === "true" ||
    process.env.NEXT_PUBLIC_REALTIME_DEBUG === "true"
  );
}

export function realtimeLog(
  message: string,
  details?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (!isRealtimeDebugEnabled()) {
    return;
  }

  if (details) {
    console.info(`[REALTIME] ${message}`, details);
    return;
  }

  console.info(`[REALTIME] ${message}`);
}

export function realtimeWarn(
  message: string,
  details?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (!isRealtimeDebugEnabled()) {
    return;
  }

  if (details) {
    console.warn(`[REALTIME] ${message}`, details);
    return;
  }

  console.warn(`[REALTIME] ${message}`);
}

export function realtimeError(
  message: string,
  details?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (!isRealtimeDebugEnabled()) {
    return;
  }

  if (details) {
    console.error(`[REALTIME] ${message}`, details);
    return;
  }

  console.error(`[REALTIME] ${message}`);
}

/** Server-side publish lifecycle logs — always on (no PII). */
export function realtimeServerLog(
  message: string,
  details?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (details) {
    console.info(`[REALTIME] ${message}`, details);
    return;
  }

  console.info(`[REALTIME] ${message}`);
}

export function realtimeServerError(
  message: string,
  details?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (details) {
    console.error(`[REALTIME] ${message}`, details);
    return;
  }

  console.error(`[REALTIME] ${message}`);
}
