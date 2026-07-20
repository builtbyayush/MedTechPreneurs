"use client";

import { useSyncExternalStore } from "react";

export function useScrollY(threshold = 0): boolean {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener("scroll", callback, { passive: true });
      return () => window.removeEventListener("scroll", callback);
    },
    () => window.scrollY > threshold,
    () => false
  );
}
