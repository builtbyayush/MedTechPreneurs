"use client";

import { useEffect } from "react";

import {
  ensureBrowserNotificationSupport,
  hasBrowserNotificationPermission,
} from "@/lib/notifications/browser-notifications";

/** Pre-register the notification service worker when Chrome permission is granted. */
export function NotificationSetup() {
  useEffect(() => {
    if (!hasBrowserNotificationPermission()) {
      return;
    }

    void ensureBrowserNotificationSupport();
  }, []);

  return null;
}
