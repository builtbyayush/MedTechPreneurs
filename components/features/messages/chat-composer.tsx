"use client";

import { Loader2, SendHorizontal } from "lucide-react";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { MESSAGE_CONTENT_MAX_LENGTH } from "@/lib/messaging/constants";
import { cn } from "@/lib/utils";

type ChatComposerProps = {
  onSend: (content: string) => Promise<boolean>;
  disabled?: boolean;
  className?: string;
};

export function ChatComposer({ onSend, disabled, className }: ChatComposerProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = content.trim();
    if (!trimmed || isSending || disabled) {
      return;
    }

    setIsSending(true);
    setErrorMessage(null);

    const sent = await onSend(trimmed);

    if (sent) {
      setContent("");
    }

    setIsSending(false);
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className={cn(
        "border-t border-white/10 bg-ink-elevated/95 px-4 py-3 backdrop-blur-md",
        className,
      )}
      aria-label="Send a message"
    >
      <div className="flex items-end gap-2">
        <label className="sr-only" htmlFor="chat-message-input">
          Message
        </label>
        <textarea
          id="chat-message-input"
          value={content}
          onChange={(event) => {
            setContent(event.target.value.slice(0, MESSAGE_CONTENT_MAX_LENGTH));
            setErrorMessage(null);
          }}
          placeholder="Write a message…"
          rows={1}
          disabled={disabled || isSending}
          className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus-visible:border-teal/50 focus-visible:ring-2 focus-visible:ring-teal/20 disabled:opacity-50"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />

        <Button
          type="submit"
          disabled={disabled || isSending || !content.trim()}
          className={cn(
            buttonVariants({ variant: "default" }),
            "size-11 shrink-0 rounded-2xl bg-teal text-ink shadow-brutal-teal hover:bg-[#33d6d6]",
          )}
          aria-label={isSending ? "Sending message" : "Send message"}
        >
          {isSending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <SendHorizontal className="size-4" aria-hidden />
          )}
        </Button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-white/40">
        <span>{content.length}/{MESSAGE_CONTENT_MAX_LENGTH}</span>
        {errorMessage ? (
          <span className="text-coral" role="alert">
            {errorMessage}
          </span>
        ) : (
          <span>Enter to send, Shift+Enter for a new line</span>
        )}
      </div>
    </form>
  );
}
