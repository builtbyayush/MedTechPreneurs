"use client";

import { Loader2 } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type DiscoveryResetDialogProps = {
  open: boolean;
  passedCount: number;
  isResetting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DiscoveryResetDialog({
  open,
  passedCount,
  isResetting = false,
  onCancel,
  onConfirm,
}: DiscoveryResetDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isResetting) {
        event.preventDefault();
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isResetting, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="discovery-reset-title"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isResetting) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-founder-card">
        <h2
          id="discovery-reset-title"
          className="font-heading text-lg font-bold text-foreground"
        >
          Reset passed profiles?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {passedCount > 0
            ? `${passedCount} passed ${
                passedCount === 1 ? "profile" : "profiles"
              } will become available in Discovery again.`
            : "Previously passed profiles will become available in Discovery again."}{" "}
          Your Connect requests, matches, and conversations will not be affected.
        </p>

        <div className="mt-5 flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-border bg-muted text-foreground"
            disabled={isResetting}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 bg-teal font-bold text-ink hover:bg-teal/80"
            disabled={isResetting}
            aria-busy={isResetting}
            onClick={onConfirm}
          >
            {isResetting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Resetting…
              </>
            ) : (
              "Reset passed profiles"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
