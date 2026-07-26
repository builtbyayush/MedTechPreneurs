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
};

export function ReportProfileButton({
  reportedUserId,
  reportedUserName,
  className,
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
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedUserId,
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
          "Our team will review this report. Admin review tooling is coming soon.",
        variant: "success",
      });
      setOpen(false);
      setReason("");
      setDescription("");
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
        className={cn("text-white/50 hover:bg-white/5 hover:text-white", className)}
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
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-elevated p-5 shadow-founder-card">
            <h2
              id="report-dialog-title"
              className="font-heading text-lg font-bold text-white"
            >
              Report {reportedUserName}
            </h2>
            <p className="mt-2 text-sm text-white/55">
              Select a reason. Reports are stored for admin review.
            </p>

            <div className="mt-4 space-y-2">
              {REPORT_REASONS.map((item) => (
                <label
                  key={item}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm",
                    reason === item
                      ? "border-teal/40 bg-teal/10 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/70",
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

            <label className="mt-4 block text-xs font-semibold tracking-wide text-white/45 uppercase">
              Additional details (optional)
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Share context that helps our review."
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/35"
            />

            <div className="mt-5 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-white/15 bg-white/[0.03] text-white"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-teal font-bold text-ink hover:bg-[#33d6d6]"
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
  userName,
  className,
}: {
  userName: string;
  className?: string;
}) {
  const { toast } = useToast();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("text-white/50 hover:bg-white/5 hover:text-white", className)}
      onClick={() =>
        toast({
          title: "Block user",
          description: `Blocking ${userName} is a placeholder in private beta.`,
        })
      }
    >
      Block user
    </Button>
  );
}
