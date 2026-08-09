"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getBrowserNotificationPermission,
  isBrowserNotificationSupported,
  requestBrowserNotificationPermission,
  type BrowserNotificationPermission,
} from "@/lib/notifications/browser-notifications";

export function useBrowserNotifications() {
  const [permission, setPermission] = useState<BrowserNotificationPermission>(
    "unsupported",
  );
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isBrowserNotificationSupported());
    setPermission(getBrowserNotificationPermission());
  }, []);

  const refreshPermission = useCallback(() => {
    setPermission(getBrowserNotificationPermission());
  }, []);

  const requestPermission = useCallback(async () => {
    const next = await requestBrowserNotificationPermission();
    setPermission(next);
    return next;
  }, []);

  return {
    supported,
    permission,
    refreshPermission,
    requestPermission,
    isGranted: permission === "granted",
    isDenied: permission === "denied",
    canRequest: supported && permission === "default",
  };
}
