"use client";

import { motion } from "framer-motion";
import { MessageCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PageContainer } from "@/components/features/app/page-container";
import { SectionHeader } from "@/components/features/app/section-header";
import { DiscoveryEmptyState } from "@/components/features/discovery/discovery-empty-state";
import { ConversationRow } from "@/components/features/messages/conversation-row";
import { ConversationsListSkeleton } from "@/components/features/messages/conversations-list-skeleton";
import { useMessagingPoll } from "@/hooks/use-messaging-poll";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { fadeUpTransition } from "@/lib/motion";
import type {
  ConversationListItem,
  ConversationListResponse,
} from "@/types/messaging";

type ConversationsState = "loading" | "ready" | "empty" | "error";

export function ConversationsFeed() {
  const reducedMotion = usePrefersReducedMotion();
  const [state, setState] = useState<ConversationsState>("loading");
  const [conversations, setConversations] = useState<ConversationListItem[]>(
    [],
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadConversations = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setState("loading");
    }

    setErrorMessage(null);

    try {
      const response = await fetch("/api/conversations", { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as
        | ConversationListResponse
        | { error?: string }
        | null;

      if (!response.ok) {
        setErrorMessage(
          payload && "error" in payload && payload.error
            ? payload.error
            : "Unable to load conversations right now.",
        );
        setState("error");
        return;
      }

      const nextConversations =
        (payload as ConversationListResponse).conversations ?? [];
      setConversations(nextConversations);
      setState(nextConversations.length > 0 ? "ready" : "empty");
    } catch {
      setErrorMessage("Unable to load conversations right now.");
      setState("error");
    }
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const response = await fetch("/api/conversations", { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as
          | ConversationListResponse
          | { error?: string }
          | null;

        if (!active) {
          return;
        }

        if (!response.ok) {
          setErrorMessage(
            payload && "error" in payload && payload.error
              ? payload.error
              : "Unable to load conversations right now.",
          );
          setState("error");
          return;
        }

        const nextConversations =
          (payload as ConversationListResponse).conversations ?? [];
        setConversations(nextConversations);
        setState(nextConversations.length > 0 ? "ready" : "empty");
      } catch {
        if (!active) {
          return;
        }
        setErrorMessage("Unable to load conversations right now.");
        setState("error");
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useMessagingPoll(() => loadConversations(false), {
    enabled: state === "ready" || state === "empty",
  });

  return (
    <PageContainer className="pb-8 pt-2">
      <SectionHeader
        title="Messages"
        description="Chat with founders you've mutually matched with."
      />

      <div className="mt-4">
        {state === "loading" ? <ConversationsListSkeleton /> : null}

        {state === "empty" ? (
          <DiscoveryEmptyState
            icon={MessageCircle}
            title="No conversations yet"
            description="When you match with a founder, a conversation opens automatically. Connect on Discover to start talking."
          />
        ) : null}

        {state === "error" ? (
          <DiscoveryEmptyState
            icon={RefreshCw}
            title="Messages unavailable"
            description={
              errorMessage ??
              "Something went wrong while loading your conversations."
            }
            actionLabel="Try again"
            onAction={() => void loadConversations(true)}
          />
        ) : null}

        {state === "ready" ? (
          <ul className="space-y-3" aria-label="Recent conversations">
            {conversations.map((conversation, index) => (
              <motion.li
                key={conversation.id}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={fadeUpTransition(reducedMotion, index * 0.03)}
              >
                <ConversationRow conversation={conversation} />
              </motion.li>
            ))}
          </ul>
        ) : null}
      </div>
    </PageContainer>
  );
}
