import { conversationRoute, ROUTES } from "@/constants/routes";

export type BrowserNotificationPermission = NotificationPermission | "unsupported";

export type MessageBrowserNotificationInput = {
  messageId: string;
  conversationId: string;
  senderName: string;
  body?: string;
  sentAt?: string;
};

export type BrowserNotificationResult = {
  ok: boolean;
  reason?:
    | "unsupported"
    | "insecure_origin"
    | "permission_denied"
    | "permission_default"
    | "deduped"
    | "display_failed";
  detail?: string;
};

const notifiedMessageIds = new Set<string>();
const notifiedConversationActivity = new Set<string>();
const activePageNotifications = new Set<Notification>();
const MAX_NOTIFIED_IDS = 500;
const MAX_ACTIVE_PAGE_NOTIFICATIONS = 20;

const NOTIFICATION_ICON = "/icon-192";
const NOTIFICATION_SHOW_TIMEOUT_MS = 2_500;

function isLocalhostHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".localhost")
  );
}

export function isBrowserNotificationSupported(): boolean {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (window.isSecureContext) {
    return true;
  }

  return isLocalhostHostname(window.location.hostname);
}

export function getBrowserNotificationPermission(): BrowserNotificationPermission {
  if (!isBrowserNotificationSupported()) {
    return "unsupported";
  }

  return Notification.permission;
}

export function hasBrowserNotificationPermission(): boolean {
  return getBrowserNotificationPermission() === "granted";
}

export async function requestBrowserNotificationPermission(): Promise<BrowserNotificationPermission> {
  if (!isBrowserNotificationSupported()) {
    return "unsupported";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function shouldShowBrowserNotification(input: {
  isOwnMessage: boolean;
  isActiveConversation: boolean;
  isDocumentVisible: boolean;
  isDocumentFocused?: boolean;
}): boolean {
  if (input.isOwnMessage) {
    return false;
  }

  const isDocumentFocused =
    input.isDocumentFocused ?? input.isDocumentVisible;

  if (
    input.isActiveConversation &&
    input.isDocumentVisible &&
    isDocumentFocused
  ) {
    return false;
  }

  return hasBrowserNotificationPermission();
}

function reserveMessageNotification(messageId: string): boolean {
  if (notifiedMessageIds.has(messageId)) {
    return false;
  }

  notifiedMessageIds.add(messageId);

  if (notifiedMessageIds.size > MAX_NOTIFIED_IDS) {
    const oldest = notifiedMessageIds.values().next().value;
    if (oldest) {
      notifiedMessageIds.delete(oldest);
    }
  }

  return true;
}

export function resetBrowserNotificationDedupeCache(): void {
  notifiedMessageIds.clear();
  notifiedConversationActivity.clear();
  for (const notification of activePageNotifications) {
    notification.close();
  }
  activePageNotifications.clear();
}

function trackPageNotification(notification: Notification): void {
  activePageNotifications.add(notification);

  if (activePageNotifications.size > MAX_ACTIVE_PAGE_NOTIFICATIONS) {
    const oldest = activePageNotifications.values().next().value;
    oldest?.close();
    if (oldest) {
      activePageNotifications.delete(oldest);
    }
  }

  notification.onclose = () => {
    activePageNotifications.delete(notification);
  };
}

function reserveConversationActivity(
  conversationId: string,
  activityAt: string,
): boolean {
  const key = `${conversationId}:${activityAt}`;

  if (notifiedConversationActivity.has(key)) {
    return false;
  }

  notifiedConversationActivity.add(key);

  if (notifiedConversationActivity.size > MAX_NOTIFIED_IDS) {
    const oldest = notifiedConversationActivity.values().next().value;
    if (oldest) {
      notifiedConversationActivity.delete(oldest);
    }
  }

  return true;
}

async function ensureNotificationServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  try {
    let registration = await navigator.serviceWorker.getRegistration("/");

    if (!registration) {
      registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
    }

    await navigator.serviceWorker.ready;
    return registration;
  } catch (error) {
    console.warn("[notifications] service worker registration failed", error);
    return null;
  }
}

export async function ensureBrowserNotificationSupport(): Promise<void> {
  await ensureNotificationServiceWorker();
}

function absoluteAssetUrl(path: string): string {
  return new URL(path, window.location.origin).href;
}

function attachNotificationClickHandler(
  notification: Notification,
  conversationId: string,
): void {
  notification.onclick = (event) => {
    event.preventDefault();
    notification.close();

    const target = conversationId
      ? conversationRoute(conversationId)
      : ROUTES.app.messages;

    if (window.location.pathname !== target) {
      window.location.assign(target);
    } else {
      window.focus();
    }
  };
}

function buildNotificationOptions(input: {
  body: string;
  conversationId: string;
  messageId: string;
  requireInteraction?: boolean;
  withIcon?: boolean;
}): NotificationOptions {
  const options: NotificationOptions = {
    body: input.body,
    tag: `splice-${input.conversationId || input.messageId}`,
    silent: false,
    requireInteraction: input.requireInteraction ?? false,
  };

  if (input.withIcon !== false) {
    options.icon = absoluteAssetUrl(NOTIFICATION_ICON);
  }

  return options;
}

function waitForNotificationShow(notification: Notification): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;

    const finish = (ok: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(ok);
    };

    notification.onshow = () => finish(true);
    notification.onerror = () => {
      activePageNotifications.delete(notification);
      finish(false);
    };

    setTimeout(() => finish(false), NOTIFICATION_SHOW_TIMEOUT_MS);
  });
}

/** Sync page notification — call directly from a click handler when possible. */
function showViaPageNotificationSync(input: {
  title: string;
  body: string;
  conversationId: string;
  messageId: string;
  requireInteraction?: boolean;
  withIcon?: boolean;
}): BrowserNotificationResult {
  try {
    const notification = new Notification(
      input.title,
      buildNotificationOptions({
        body: input.body,
        conversationId: input.conversationId,
        messageId: input.messageId,
        requireInteraction: input.requireInteraction,
        withIcon: input.withIcon,
      }),
    );

    trackPageNotification(notification);
    attachNotificationClickHandler(notification, input.conversationId);

    return { ok: true };
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Could not create notification";

    if (input.withIcon !== false) {
      return showViaPageNotificationSync({ ...input, withIcon: false });
    }

    return {
      ok: false,
      reason: "display_failed",
      detail,
    };
  }
}

async function showViaPageNotification(input: {
  title: string;
  body: string;
  conversationId: string;
  messageId: string;
  requireInteraction?: boolean;
  withIcon?: boolean;
}): Promise<boolean> {
  try {
    const notification = new Notification(
      input.title,
      buildNotificationOptions({
        body: input.body,
        conversationId: input.conversationId,
        messageId: input.messageId,
        requireInteraction: input.requireInteraction,
        withIcon: input.withIcon,
      }),
    );

    trackPageNotification(notification);
    attachNotificationClickHandler(notification, input.conversationId);

    return waitForNotificationShow(notification);
  } catch (error) {
    console.warn("[notifications] page notification failed", error);

    if (input.withIcon !== false) {
      return showViaPageNotification({ ...input, withIcon: false });
    }

    return false;
  }
}

async function showViaServiceWorker(input: {
  title: string;
  body: string;
  conversationId: string;
  messageId: string;
  requireInteraction?: boolean;
  withIcon?: boolean;
}): Promise<boolean> {
  const registration = await ensureNotificationServiceWorker();

  if (!registration) {
    return false;
  }

  const options = buildNotificationOptions({
    body: input.body,
    conversationId: input.conversationId,
    messageId: input.messageId,
    requireInteraction: input.requireInteraction,
    withIcon: input.withIcon,
  });

  try {
    await registration.showNotification(input.title, {
      ...options,
      data: {
        conversationId: input.conversationId,
        messageId: input.messageId,
        url: input.conversationId
          ? conversationRoute(input.conversationId)
          : ROUTES.app.messages,
      },
    });
    return true;
  } catch (error) {
    console.warn("[notifications] service worker notification failed", error);

    if (input.withIcon !== false) {
      return showViaServiceWorker({ ...input, withIcon: false });
    }

    return false;
  }
}

async function displayNativeNotification(input: {
  title: string;
  body: string;
  conversationId: string;
  messageId: string;
  requireInteraction?: boolean;
}): Promise<boolean> {
  const payload = {
    title: input.title,
    body: input.body,
    conversationId: input.conversationId,
    messageId: input.messageId,
    requireInteraction: input.requireInteraction,
  };

  // Inbound messages arrive async — service worker is the reliable Chrome path.
  if (await showViaServiceWorker(payload)) {
    return true;
  }

  if (await showViaPageNotification(payload)) {
    return true;
  }

  return showViaPageNotification({ ...payload, withIcon: false });
}

function unsupportedResult(): BrowserNotificationResult {
  if (
    typeof window !== "undefined" &&
    !window.isSecureContext &&
    !isLocalhostHostname(window.location.hostname)
  ) {
    return {
      ok: false,
      reason: "insecure_origin",
      detail: `Native Chrome notifications require http://localhost:3000 — you are on ${window.location.host}.`,
    };
  }

  return {
    ok: false,
    reason: "unsupported",
    detail: "This browser does not support desktop notifications.",
  };
}

function permissionResult(
  permission: NotificationPermission,
): BrowserNotificationResult | null {
  if (permission === "granted") {
    return null;
  }

  if (permission === "default") {
    return {
      ok: false,
      reason: "permission_default",
      detail: "Allow notifications for localhost in Chrome first.",
    };
  }

  return {
    ok: false,
    reason: "permission_denied",
    detail:
      "Chrome blocked notifications for this profile. Open chrome://settings/content/notifications and allow localhost:3000.",
  };
}

export async function showMessageBrowserNotification(
  input: MessageBrowserNotificationInput,
): Promise<BrowserNotificationResult> {
  if (!isBrowserNotificationSupported()) {
    return unsupportedResult();
  }

  const blocked = permissionResult(Notification.permission);
  if (blocked) {
    return blocked;
  }

  const activityAt = input.sentAt ?? input.messageId;

  if (
    input.conversationId &&
    !reserveConversationActivity(input.conversationId, activityAt)
  ) {
    return { ok: false, reason: "deduped" };
  }

  if (!reserveMessageNotification(input.messageId)) {
    return { ok: false, reason: "deduped" };
  }

  const shown = await displayNativeNotification({
    title: `New message from ${input.senderName}`,
    body: input.body ?? "You have a new message",
    conversationId: input.conversationId,
    messageId: input.messageId,
  });

  if (!shown) {
    notifiedMessageIds.delete(input.messageId);
    if (input.conversationId) {
      notifiedConversationActivity.delete(`${input.conversationId}:${activityAt}`);
    }

    console.warn("[notifications] native alert not shown", {
      conversationId: input.conversationId,
      messageId: input.messageId,
    });

    return {
      ok: false,
      reason: "display_failed",
      detail:
        "Chrome did not show a native banner. Check macOS Settings → Notifications → Google Chrome → Banners.",
    };
  }

  return { ok: true };
}

/**
 * Call synchronously from a button click — Chrome is most reliable this way.
 */
export function showTestBrowserNotificationFromClick(): BrowserNotificationResult {
  if (!isBrowserNotificationSupported()) {
    return unsupportedResult();
  }

  const blocked = permissionResult(Notification.permission);
  if (blocked) {
    return blocked;
  }

  const messageId = `test-${Date.now()}`;
  const result = showViaPageNotificationSync({
    title: "Splice+ test notification",
    body: "This is a native Chrome notification from Splice+.",
    conversationId: "",
    messageId,
    requireInteraction: true,
  });

  if (result.ok) {
    return {
      ok: true,
      detail:
        "Native notification created. On Mac, switch away from Chrome if you do not see a banner.",
    };
  }

  return result;
}

export async function showTestBrowserNotification(): Promise<BrowserNotificationResult> {
  const syncResult = showTestBrowserNotificationFromClick();
  if (syncResult.ok) {
    return syncResult;
  }

  if (!isBrowserNotificationSupported()) {
    return unsupportedResult();
  }

  if (Notification.permission === "default") {
    const requested = await requestBrowserNotificationPermission();
    if (requested !== "granted") {
      if (requested === "unsupported") {
        return unsupportedResult();
      }
      return permissionResult(requested) ?? syncResult;
    }
  }

  await ensureBrowserNotificationSupport();

  const messageId = `test-${Date.now()}`;
  const shown = await displayNativeNotification({
    title: "Splice+ test notification",
    body: "This is a native Chrome notification from Splice+.",
    conversationId: "",
    messageId,
    requireInteraction: true,
  });

  if (!shown) {
    return {
      ok: false,
      reason: "display_failed",
      detail:
        "Chrome did not show a native banner. Check macOS Settings → Notifications → Google Chrome.",
    };
  }

  return {
    ok: true,
    detail:
      "Native notification sent via service worker. Check Notification Center (top-right) on Mac.",
  };
}

export function getBrowserNotificationStatusLabel(
  permission: BrowserNotificationPermission,
): string {
  switch (permission) {
    case "granted":
      return "Desktop notifications enabled in Chrome";
    case "denied":
      return "Desktop notifications blocked by Chrome";
    case "default":
      return "Desktop notifications off";
    default:
      return "Desktop notifications unavailable on this URL";
  }
}

export function getBrowserNotificationUnsupportedReason(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!("Notification" in window)) {
    return "This browser does not support desktop notifications.";
  }

  if (window.isSecureContext || isLocalhostHostname(window.location.hostname)) {
    return null;
  }

  return `Native Chrome notifications require localhost. You are on ${window.location.host}.`;
}
