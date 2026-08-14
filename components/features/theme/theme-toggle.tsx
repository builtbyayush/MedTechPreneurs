"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

type ThemeToggleProps = {
  className?: string;
  /** Compact icon-only control for nav bars. */
  size?: "sm" | "md";
};

export function ThemeToggle({ className, size = "sm" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal",
        size === "sm" && "size-9",
        size === "md" && "size-10",
        className
      )}
      aria-label={mounted ? label : "Toggle theme"}
      title={mounted ? label : "Toggle theme"}
    >
      {mounted ? (
        isDark ? (
          <Sun className={size === "sm" ? "size-4" : "size-5"} aria-hidden />
        ) : (
          <Moon className={size === "sm" ? "size-4" : "size-5"} aria-hidden />
        )
      ) : (
        <span
          className={cn(
            "block rounded-full bg-muted",
            size === "sm" ? "size-4" : "size-5"
          )}
          aria-hidden
        />
      )}
    </button>
  );
}
