"use client";

import { useEffect } from "react";

/**
 * Registers the service worker for offline shell + desktop notifications.
 * Also drops obsolete workers/caches after deploys so auth fetches are not
 * trapped by a stale SW (common cause of login "Response" TypeErrors).
 */
export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    let cancelled = false;

    async function register() {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();

        // Force update of any existing controller after sw.js cache-bust.
        await Promise.all(
          registrations.map((registration) => registration.update()),
        );

        if (cancelled) {
          return;
        }

        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch (error) {
        console.error("Service worker registration failed:", error);
      }
    }

    void register();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
