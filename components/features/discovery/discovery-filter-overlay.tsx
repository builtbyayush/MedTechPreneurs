"use client";

import { Search, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DiscoveryAppliedFilters, DiscoveryProfessionOption } from "@/types/discovery";
import type { FounderRole } from "@/types/onboarding";
import { cn } from "@/lib/utils";

type DiscoveryFilterOverlayProps = {
  open: boolean;
  draftFilters: DiscoveryAppliedFilters;
  professionOptions: DiscoveryProfessionOption[];
  isApplying?: boolean;
  onDraftChange: (filters: DiscoveryAppliedFilters) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
};

function ProfessionChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-teal/40 bg-teal/15 text-teal"
          : "border-border bg-muted text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

export function DiscoveryFilterOverlay({
  open,
  draftFilters,
  professionOptions,
  isApplying = false,
  onDraftChange,
  onApply,
  onClear,
  onClose,
}: DiscoveryFilterOverlayProps) {
  const titleId = useId();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  function toggleProfession(role: FounderRole) {
    const selected = new Set(draftFilters.professions);
    if (selected.has(role)) {
      selected.delete(role);
    } else {
      selected.add(role);
    }

    onDraftChange({
      ...draftFilters,
      professions: [...selected],
    });
  }

  const hasDraftFilters =
    (draftFilters.query?.trim().length ?? 0) >= 2 ||
    draftFilters.professions.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92svh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-founder-card sm:rounded-2xl">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id={titleId}
                className="font-heading text-lg font-bold text-foreground"
              >
                Search & filter
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Narrow your Discover feed without leaving swipe mode.
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={onClose}
              aria-label="Close search and filters"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <label className="sr-only" htmlFor="discovery-filter-search">
            Search founders
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              ref={searchInputRef}
              id="discovery-filter-search"
              value={draftFilters.query ?? ""}
              onChange={(event) =>
                onDraftChange({
                  ...draftFilters,
                  query: event.target.value,
                })
              }
              placeholder="Search by name, company, skills, or role"
              className="border-border bg-muted pr-9 pl-9 text-foreground placeholder:text-muted-foreground"
              disabled={isApplying}
            />
            {draftFilters.query ? (
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() =>
                  onDraftChange({
                    ...draftFilters,
                    query: "",
                  })
                }
                aria-label="Clear search text"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Profession
              </p>
              {hasDraftFilters ? (
                <button
                  type="button"
                  className="text-xs font-medium text-teal hover:underline"
                  onClick={onClear}
                  disabled={isApplying}
                >
                  Clear all
                </button>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {professionOptions.length > 0 ? (
                professionOptions.map((option) => (
                  <ProfessionChip
                    key={option.value}
                    label={option.label}
                    active={draftFilters.professions.includes(option.value)}
                    onClick={() => toggleProfession(option.value)}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Complete onboarding to unlock profession filters.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border px-5 py-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border bg-muted text-foreground"
              disabled={isApplying}
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              type="button"
              className="flex-1 bg-teal font-bold text-ink hover:bg-teal/80"
              disabled={isApplying}
              aria-busy={isApplying}
              onClick={onApply}
            >
              {isApplying ? "Applying…" : "Apply filters"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
