"use client";

import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Avatar } from "@/components/features/app/avatar";
import { DiscoveryEmptyState } from "@/components/features/discovery/discovery-empty-state";
import { ChatComposer } from "@/components/features/messages/chat-composer";
import { ChatThreadSkeleton } from "@/components/features/messages/chat-thread-skeleton";
import { MessageBubble } from "@/components/features/messages/message-bubble";
import { ROUTES } from "@/constants/routes";
import {
  appendMessageIfNew,
  useConversationRealtime,
} from "@/hooks/use-conversation-realtime";
import { useMessagingPoll } from "@/hooks/use-messaging-poll";
import {
  MESSAGING_POLL_ENABLED,
  MESSAGING_POLL_INTERVAL_MS,
} from "@/lib/messaging/constants";
import type {
  ConversationPartner,
  MessageListItem,
  MessageListResponse,
  SendMessageResponse,
} from "@/types/messaging";

type ChatThreadProps = {
  conversationId: string;
};

type ChatState = "loading" | "ready" | "empty" | "error";

export function ChatThread({ conversationId }: ChatThreadProps) {
  const [state, setState] = useState<ChatState>("loading");
  const [messages, setMessages] = useState<MessageListItem[]>([]);
  const [partner, setPartner] = useState<ConversationPartner | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }, []);

  const loadMessages = useCallback(
    async (options?: { showLoading?: boolean; preserveScroll?: boolean }) => {
      if (options?.showLoading) {
        setState("loading");
      }

      setErrorMessage(null);

      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/messages`,
          { cache: "no-store" },
        );
        const payload = (await response.json().catch(() => null)) as
          | MessageListResponse
          | { error?: string }
          | null;

        if (!response.ok) {
          setErrorMessage(
            payload && "error" in payload && payload.error
              ? payload.error
              : "Unable to load this conversation.",
          );
          setState("error");
          return;
        }

        const data = payload as MessageListResponse;
        setPartner(data.partner);
        setMessages(data.messages);
        setState(data.messages.length > 0 ? "ready" : "empty");

        if (shouldStickToBottomRef.current) {
          requestAnimationFrame(() => scrollToBottom("auto"));
        }
      } catch {
        setErrorMessage("Unable to load this conversation.");
        setState("error");
      }
    },
    [conversationId, scrollToBottom],
  );

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/messages`,
          { cache: "no-store" },
        );
        const payload = (await response.json().catch(() => null)) as
          | MessageListResponse
          | { error?: string }
          | null;

        if (!active) {
          return;
        }

        if (!response.ok) {
          setErrorMessage(
            payload && "error" in payload && payload.error
              ? payload.error
              : "Unable to load this conversation.",
          );
          setState("error");
          return;
        }

        const data = payload as MessageListResponse;
        setPartner(data.partner);
        setMessages(data.messages);
        setState(data.messages.length > 0 ? "ready" : "empty");
        requestAnimationFrame(() => scrollToBottom("auto"));
      } catch {
        if (!active) {
          return;
        }
        setErrorMessage("Unable to load this conversation.");
        setState("error");
      }
    })();

    return () => {
      active = false;
    };
  }, [conversationId, scrollToBottom]);

  const handleRealtimeMessage = useCallback(
    (nextMessage: MessageListItem) => {
      shouldStickToBottomRef.current = true;
      setMessages((current) => appendMessageIfNew(current, nextMessage));
      setState("ready");
      requestAnimationFrame(() => scrollToBottom());
    },
    [scrollToBottom],
  );

  useConversationRealtime({
    conversationId,
    onMessage: handleRealtimeMessage,
    enabled: state === "ready" || state === "empty",
  });

  useMessagingPoll(() => loadMessages(), {
    enabled: (state === "ready" || state === "empty") && MESSAGING_POLL_ENABLED,
    intervalMs: MESSAGING_POLL_INTERVAL_MS * 4,
  });

  useEffect(() => {
    if (state === "ready" || state === "empty") {
      scrollToBottom("auto");
    }
  }, [messages.length, scrollToBottom, state]);

  async function handleSend(content: string): Promise<boolean> {
    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        },
      );

      const payload = (await response.json().catch(() => null)) as
        | SendMessageResponse
        | { error?: string; message?: string }
        | null;

      if (!response.ok) {
        setErrorMessage(
          payload && "error" in payload && payload.error
            ? payload.error
            : "Unable to send your message.",
        );
        return false;
      }

      setErrorMessage(null);
      const nextMessage = (payload as SendMessageResponse).message;
      shouldStickToBottomRef.current = true;
      setMessages((current) => appendMessageIfNew(current, nextMessage));
      setState("ready");
      requestAnimationFrame(() => scrollToBottom());
      return true;
    } catch {
      setErrorMessage("Unable to send your message.");
      return false;
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-white/10 bg-ink-elevated/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.app.messages}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="size-4" aria-hidden />
          </Link>

          {partner ? (
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar
                name={partner.name}
                imageUrl={partner.profilePhotoUrl}
                size="md"
              />
              <div className="min-w-0">
                <h1 className="truncate font-heading text-base font-extrabold text-white">
                  {partner.name}
                </h1>
                {partner.headline ? (
                  <p className="truncate text-xs text-teal/85">
                    {partner.headline}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="h-10 flex-1 animate-pulse rounded-xl bg-white/[0.05]" />
          )}
        </div>
      </header>

      <div
        ref={scrollContainerRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4"
        aria-live="polite"
        aria-label="Message history"
        onScroll={(event) => {
          const target = event.currentTarget;
          const distanceFromBottom =
            target.scrollHeight - target.scrollTop - target.clientHeight;
          shouldStickToBottomRef.current = distanceFromBottom < 96;
        }}
      >
        {state === "loading" ? <ChatThreadSkeleton /> : null}

        {state === "error" ? (
          <DiscoveryEmptyState
            icon={RefreshCw}
            title="Conversation unavailable"
            description={
              errorMessage ??
              "We couldn't open this conversation. It may no longer be available."
            }
            actionLabel="Try again"
            onAction={() => void loadMessages({ showLoading: true })}
          />
        ) : null}

        {state === "empty" ? (
          <DiscoveryEmptyState
            icon={RefreshCw}
            title="Start the conversation"
            description={`Say hello to ${partner?.name ?? "your match"} and share what you're building.`}
            className="min-h-[280px]"
          />
        ) : null}

        {state === "ready" ? (
          <div className="space-y-3">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        ) : null}
      </div>

      <div className="relative z-20 shrink-0 bg-ink-elevated pb-[env(safe-area-inset-bottom)]">
        {errorMessage && state !== "error" ? (
          <p
            className="border-t border-coral/20 bg-coral/10 px-4 py-2 text-sm text-coral"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}
        <ChatComposer
          onSend={handleSend}
          disabled={state === "loading" || state === "error"}
        />
      </div>
    </div>
  );
}
