"use client";

import { useEffect } from "react";

import { siteConfig } from "@/config/site";

export function PwaRegister() {
  useEffect(() => {
    if (!siteConfig.pwa.enabled) {
      return;
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  }, []);

  return null;
}
