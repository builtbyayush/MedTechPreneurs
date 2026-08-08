"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { INTRO_MESSAGE_MAX_LENGTH } from "@/constants/intro";
import { useToast } from "@/hooks/use-toast";
import { getFirstName } from "@/lib/user/display-name";
import { cn } from "@/lib/utils";

type IntroduceYourselfDialogProps = {
  targetUserId: string;
  targetUserName: string;
  viewerFirstName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent: (payload: { introPreview: string; introSentAt: string }) => void;
};

export function IntroduceYourselfDialog({
  targetUserId,
  targetUserName,
  viewerFirstName = "there",
  open,
  onOpenChange,
  onSent,
}: IntroduceYourselfDialogProps) {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetFirstName = getFirstName(targetUserName, "there");
  const placeholder = `Hi ${targetFirstName}, I'm ${viewerFirstName}. I'd love to connect and explore how we could work together.`;
  const characterCount = content.length;
  const trimmed = content.trim();
  const canSubmit =
    trimmed.length > 0 &&
    trimmed.length <= INTRO_MESSAGE_MAX_LENGTH &&
    !isSubmitting;

  async function handleSend() {
    if (!canSubmit) {
      if (!trimmed) {
        setError("Write a short introduction before sending.");
      }
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/matches/intro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId,
          content: trimmed,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        message?: string;
        introPreview?: string;
        introSentAt?: string;
      } | null;

      if (!response.ok) {
        const message =
          payload?.error ??
          payload?.message ??
          "Unable to send introduction. Please try again.";
        setError(message);
        toast({
          title: "Introduction not sent",
          description: message,
          variant: "error",
        });
        setIsSubmitting(false);
        return;
      }

      onSent({
        introPreview: payload?.introPreview ?? trimmed,
        introSentAt: payload?.introSentAt ?? new Date().toISOString(),
      });
      setContent("");
      onOpenChange(false);
      toast({
        title: "Introduction sent",
        description: "Waiting for them to respond.",
        variant: "success",
      });
    } catch {
      setError("Check your connection and try again.");
      toast({
        title: "Introduction not sent",
        description: "Check your connection and try again.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="introduce-yourself-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-elevated p-5 shadow-founder-card">
        <h2
          id="introduce-yourself-title"
          className="font-heading text-lg font-bold text-white"
        >
          Introduce Yourself
        </h2>
        <p className="mt-2 text-sm text-white/55">
          Send a short introduction before they decide to connect.
        </p>

        <label
          htmlFor="introduce-yourself-message"
          className="mt-4 block text-xs font-semibold tracking-wide text-white/45 uppercase"
        >
          Message
        </label>
        <textarea
          id="introduce-yourself-message"
          value={content}
          onChange={(event) => {
            setContent(event.target.value.slice(0, INTRO_MESSAGE_MAX_LENGTH));
            setError(null);
          }}
          rows={5}
          maxLength={INTRO_MESSAGE_MAX_LENGTH}
          placeholder={placeholder}
          disabled={isSubmitting}
          className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus-visible:border-teal/50 focus-visible:ring-2 focus-visible:ring-teal/20 disabled:opacity-50"
        />

        <div className="mt-2 flex items-center justify-between gap-3">
          <p
            className={cn(
              "text-xs tabular-nums",
              characterCount >= INTRO_MESSAGE_MAX_LENGTH
                ? "text-coral"
                : "text-white/40",
            )}
          >
            {characterCount} / {INTRO_MESSAGE_MAX_LENGTH}
          </p>
        </div>

        {error ? (
          <p className="mt-3 text-sm text-coral" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-white/15 bg-white/[0.03] text-white"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 bg-teal font-bold text-ink hover:bg-[#33d6d6]"
            disabled={!canSubmit}
            onClick={() => void handleSend()}
          >
            {isSubmitting ? "Sending…" : "Send Introduction"}
          </Button>
        </div>
      </div>
    </div>
  );
}
