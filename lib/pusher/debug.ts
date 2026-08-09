const isDev = process.env.NODE_ENV === "development";

export function pusherDevLog(
  event: string,
  details?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (!isDev) {
    return;
  }

  if (details) {
    console.info(`[pusher] ${event}`, details);
    return;
  }

  console.info(`[pusher] ${event}`);
}

export function pusherDevWarn(
  event: string,
  details?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (!isDev) {
    return;
  }

  if (details) {
    console.warn(`[pusher] ${event}`, details);
    return;
  }

  console.warn(`[pusher] ${event}`);
}

export function pusherDevError(
  event: string,
  details?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (!isDev) {
    return;
  }

  if (details) {
    console.error(`[pusher] ${event}`, details);
    return;
  }

  console.error(`[pusher] ${event}`);
}
