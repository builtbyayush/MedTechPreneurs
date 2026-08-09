import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  resetBrowserNotificationDedupeCache,
  shouldShowBrowserNotification,
  showMessageBrowserNotification,
  showTestBrowserNotificationFromClick,
} from "@/lib/notifications/browser-notifications";

function stubNotificationPermission(permission: NotificationPermission): void {
  class MockNotification {
    static permission = permission;

    title: string;
    options?: NotificationOptions;
    onclick: ((event: Event) => void) | null = null;
    onshow: (() => void) | null = null;
    onerror: (() => void) | null = null;

    constructor(title: string, options?: NotificationOptions) {
      this.title = title;
      this.options = options;
      queueMicrotask(() => this.onshow?.());
    }

    close() {}
  }

  vi.stubGlobal("Notification", MockNotification as unknown as typeof Notification);
  vi.stubGlobal("document", { visibilityState: "visible" });
  vi.stubGlobal("window", {
    focus: vi.fn(),
    location: {
      pathname: "/home",
      origin: "http://localhost:3000",
      hostname: "localhost",
      host: "localhost:3000",
      assign: vi.fn(),
    },
    Notification: MockNotification,
    isSecureContext: true,
  });
  vi.stubGlobal("navigator", {});
}

describe("browser notifications", () => {
  beforeEach(() => {
    resetBrowserNotificationDedupeCache();
    vi.unstubAllGlobals();
  });

  describe("shouldShowBrowserNotification", () => {
    it("suppresses notifications for own messages", () => {
      stubNotificationPermission("granted");

      expect(
        shouldShowBrowserNotification({
          isOwnMessage: true,
          isActiveConversation: false,
          isDocumentVisible: true,
          isDocumentFocused: true,
        }),
      ).toBe(false);
    });

    it("allows notifications on other pages when permission is granted", () => {
      stubNotificationPermission("granted");

      expect(
        shouldShowBrowserNotification({
          isOwnMessage: false,
          isActiveConversation: false,
          isDocumentVisible: true,
          isDocumentFocused: true,
        }),
      ).toBe(true);
    });
  });

  describe("showTestBrowserNotificationFromClick", () => {
    it("creates a native notification synchronously", () => {
      stubNotificationPermission("granted");

      const result = showTestBrowserNotificationFromClick();

      expect(result.ok).toBe(true);
    });
  });

  describe("showMessageBrowserNotification", () => {
    it("deduplicates notifications by messageId", async () => {
      vi.useFakeTimers();
      stubNotificationPermission("granted");

      const firstPromise = showMessageBrowserNotification({
        messageId: "msg-1",
        conversationId: "conv-1",
        senderName: "Dev Test",
      });
      await vi.runAllTimersAsync();
      const first = await firstPromise;

      const second = await showMessageBrowserNotification({
        messageId: "msg-1",
        conversationId: "conv-1",
        senderName: "Dev Test",
      });

      vi.useRealTimers();

      expect(first.ok).toBe(true);
      expect(second.ok).toBe(false);
      expect(second.reason).toBe("deduped");
    });
  });
});
