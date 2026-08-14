"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  REPORT_REASON_LABELS,
  REPORT_REASONS,
  type ReportReason,
} from "@/constants/reports";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ReportProfileDialogProps = {
  reportedUserId: string;
  reportedUserName: string;
  className?: string;
  onReported?: () => void;
};

export function ReportProfileButton({
  reportedUserId,
  reportedUserName,
  className,
  onReported,
}: ReportProfileDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitReport() {
    if (!reason || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/users/${reportedUserId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          description,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;

      if (!response.ok) {
        toast({
          title: "Could not submit report",
          description: payload?.error ?? payload?.message ?? "Please try again.",
          variant: "error",
        });
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Report submitted",
        description:
          payload?.message ??
          "Our team will review it. You've also blocked this user.",
        variant: "success",
      });
      setOpen(false);
      setReason("");
      setDescription("");
      onReported?.();
    } catch {
      toast({
        title: "Could not submit report",
        description: "Check your connection and try again.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn("text-muted-foreground hover:bg-muted hover:text-foreground", className)}
        onClick={() => setOpen(true)}
      >
        Report profile
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-dialog-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-founder-card">
            <h2
              id="report-dialog-title"
              className="font-heading text-lg font-bold text-foreground"
            >
              Report {reportedUserName}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Select a reason. Reports are stored for admin review.
            </p>

            <div className="mt-4 space-y-2">
              {REPORT_REASONS.map((item) => (
                <label
                  key={item}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm",
                    reason === item
                      ? "border-teal/40 bg-teal/10 text-foreground"
                      : "border-border bg-muted text-muted-foreground",
                  )}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={item}
                    checked={reason === item}
                    onChange={() => setReason(item)}
                    className="accent-teal"
                  />
                  {REPORT_REASON_LABELS[item]}
                </label>
              ))}
            </div>

            <label className="mt-4 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Additional details (optional)
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Share context that helps our review."
              className="mt-2 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            />

            <div className="mt-5 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-border bg-muted text-foreground"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-teal font-bold text-ink hover:bg-teal/80"
                disabled={!reason || isSubmitting}
                onClick={() => void submitReport()}
              >
                {isSubmitting ? "Submitting…" : "Submit report"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function BlockUserButton({
  blockedUserId,
  userName,
  className,
  onBlocked,
}: {
  blockedUserId: string;
  userName: string;
  className?: string;
  onBlocked?: () => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitBlock() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/users/${blockedUserId}/block`, {
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;

      if (!response.ok) {
        toast({
          title: "Could not block user",
          description: payload?.error ?? payload?.message ?? "Please try again.",
          variant: "error",
        });
        return;
      }

      toast({
        title: "User blocked",
        description:
          payload?.message ??
          `${userName} has been blocked. You won't see each other or be able to message.`,
        variant: "success",
      });
      setOpen(false);
      onBlocked?.();
    } catch {
      toast({
        title: "Could not block user",
        description: "Check your connection and try again.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn("text-muted-foreground hover:bg-muted hover:text-foreground", className)}
        onClick={() => setOpen(true)}
      >
        Block user
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="block-dialog-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-founder-card">
            <h2
              id="block-dialog-title"
              className="font-heading text-lg font-bold text-foreground"
            >
              Block {userName}?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You won&apos;t see each other in Discover, Matches, or Messages.
              You can unblock them later from Settings.
            </p>

            <div className="mt-5 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-border bg-muted text-foreground"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-coral font-bold text-foreground hover:bg-coral/90"
                disabled={isSubmitting}
                onClick={() => void submitBlock()}
              >
                {isSubmitting ? "Blocking…" : "Block user"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
