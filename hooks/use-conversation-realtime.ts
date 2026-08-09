"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

import { useMessagingRealtime } from "@/components/providers/messaging-realtime-provider";
import {
  appendMessageIfNew,
  messageFromRealtimeEvent,
} from "@/lib/messaging/message-utils";
import type { MessageNewEventPayload } from "@/lib/pusher/events";
import type { MessageListItem } from "@/types/messaging";

type UseConversationRealtimeOptions = {
  conversationId: string;
  onMessage: (message: MessageListItem) => void;
  enabled?: boolean;
};

export function useConversationRealtime({
  conversationId,
  onMessage,
  enabled = true,
}: UseConversationRealtimeOptions) {
  const { data: session } = useSession();
  const { subscribeToConversation } = useMessagingRealtime();
  const viewerId = session?.user?.id;

  useEffect(() => {
    if (!enabled || !viewerId) {
      return;
    }

    return subscribeToConversation(
      conversationId,
      (payload: MessageNewEventPayload) => {
        const nextMessage = messageFromRealtimeEvent(payload, viewerId);
        onMessage(nextMessage);
      },
    );
  }, [
    conversationId,
    enabled,
    onMessage,
    subscribeToConversation,
    viewerId,
  ]);
}

export { appendMessageIfNew };
