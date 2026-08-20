"use client";

import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

type DiscoverySearchTriggerProps = {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
};

export function DiscoverySearchTrigger({
  active = false,
  disabled = false,
  onClick,
  className,
}: DiscoverySearchTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={
        active
          ? "Search and filters active. Open search and filters."
          : "Open search and filters"
      }
      aria-pressed={active}
      className={cn(
        "fixed right-4 z-30 flex size-12 items-center justify-center rounded-full border shadow-founder-card transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:opacity-60",
        active
          ? "border-teal/40 bg-teal text-ink"
          : "border-border bg-card text-foreground hover:bg-muted",
        className,
      )}
      style={{ bottom: "calc(8.75rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <Search className="size-5" aria-hidden />
    </button>
  );
}
