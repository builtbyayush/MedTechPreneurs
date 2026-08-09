"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useToast } from "@/hooks/use-toast";
import { useMessagingPoll } from "@/hooks/use-messaging-poll";
import { ROUTES } from "@/constants/routes";
import {
  MESSAGING_POLL_ENABLED,
  MESSAGING_POLL_INTERVAL_MS,
} from "@/lib/messaging/constants";
import { getChatChannelName, getUserChannelName } from "@/lib/pusher/channels";
import {
  ensurePusherClient,
  getPusherClient,
} from "@/lib/pusher/client";
import {
  PUSHER_MESSAGE_NEW_EVENT,
  type MessageNewEventPayload,
} from "@/lib/pusher/events";
import { realtimeError, realtimeLog } from "@/lib/pusher/realtime-log";
import {
  shouldShowBrowserNotification,
  showMessageBrowserNotification,
} from "@/lib/notifications/browser-notifications";
import type {
  ConversationListItem,
  ConversationListResponse,
} from "@/types/messaging";

type MessageListener = (payload: MessageNewEventPayload) => void;

type MessagingRealtimeContextValue = {
  conversations: ConversationListItem[];
  totalUnreadCount: number;
  isLoadingConversations: boolean;
  refreshConversations: () => Promise<void>;
  subscribeToConversation: (
    conversationId: string,
    listener: MessageListener,
  ) => () => void;
  activeConversationId: string | null;
  isRealtimeEnabled: boolean;
};

const MessagingRealtimeContext =
  createContext<MessagingRealtimeContextValue | null>(null);

function getActiveConversationId(pathname: string): string | null {
  const prefix = `${ROUTES.app.messages}/`;

  if (!pathname.startsWith(prefix)) {
    return null;
  }

  const conversationId = pathname.slice(prefix.length).split("/")[0]?.trim();
  return conversationId || null;
}

async function markConversationRead(conversationId: string): Promise<void> {
  await fetch(`/api/conversations/${conversationId}/read`, {
    method: "POST",
  }).catch(() => undefined);
}

export function MessagingRealtimeProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { toast } = useToast();
  const viewerId = session?.user?.id ?? null;
  const activeConversationId = getActiveConversationId(pathname);

  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [pusherReady, setPusherReady] = useState(false);
  const listenersRef = useRef<Map<string, Set<MessageListener>>>(new Map());
  const subscribedChannelsRef = useRef<Set<string>>(new Set());
  const userChannelRef = useRef<string | null>(null);
  const partnerNamesRef = useRef<Map<string, string>>(new Map());
  const conversationSnapshotRef = useRef<
    Map<string, { unreadCount: number; lastMessageAt: string }>
  >(new Map());
  const activeConversationIdRef = useRef<string | null>(activeConversationId);
  const viewerIdRef = useRef<string | null>(viewerId);
  const handleIncomingMessageRef = useRef<
    (payload: MessageNewEventPayload) => void
  >(() => undefined);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    viewerIdRef.current = viewerId;
  }, [viewerId]);

  useEffect(() => {
    if (!viewerId) {
      setPusherReady(false);
      return;
    }

    let cancelled = false;

    void ensurePusherClient().then((client) => {
      if (!cancelled) {
        setPusherReady(Boolean(client));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [viewerId]);

  const notifyInboundMessage = useCallback(
    (input: {
      messageId: string;
      conversationId: string;
      senderName: string;
      sentAt: string;
      senderId?: string;
    }) => {
      const currentViewerId = viewerIdRef.current;
      const currentActiveConversationId = activeConversationIdRef.current;

      if (!currentViewerId) {
        return;
      }

      const isOwnMessage = input.senderId === currentViewerId;
      const isActiveConversation =
        currentActiveConversationId === input.conversationId;
      const isDocumentVisible = document.visibilityState === "visible";
      const isDocumentFocused = document.hasFocus();
      const isActivelyViewingConversation =
        isActiveConversation && isDocumentVisible && isDocumentFocused;

      if (isOwnMessage || isActivelyViewingConversation) {
        return;
      }

      if (isDocumentVisible && isDocumentFocused) {
        toast({
          title: `New message from ${input.senderName}`,
          description: "Open Messages to reply.",
          variant: "default",
        });
      }

      if (
        shouldShowBrowserNotification({
          isOwnMessage: false,
          isActiveConversation,
          isDocumentVisible,
          isDocumentFocused,
        })
      ) {
        realtimeLog("showing desktop notification", {
          conversationId: input.conversationId,
          messageId: input.messageId,
        });

        void showMessageBrowserNotification({
          messageId: input.messageId,
          conversationId: input.conversationId,
          senderName: input.senderName,
          sentAt: input.sentAt,
        }).then((result) => {
          if (!result.ok && result.reason !== "deduped") {
            realtimeLog("desktop notification skipped", {
              reason: result.reason ?? "unknown",
              detail: result.detail,
            });
          }
        });
      }
    },
    [toast],
  );

  const refreshConversations = useCallback(async () => {
    if (!viewerId) {
      setConversations([]);
      setIsLoadingConversations(false);
      conversationSnapshotRef.current.clear();
      return;
    }

    try {
      const response = await fetch("/api/conversations", { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as
        | ConversationListResponse
        | { error?: string }
        | null;

      if (!response.ok || !payload || !("conversations" in payload)) {
        return;
      }

      const previousSnapshot = conversationSnapshotRef.current;
      const nextSnapshot = new Map<
        string,
        { unreadCount: number; lastMessageAt: string }
      >();

      for (const conversation of payload.conversations) {
        nextSnapshot.set(conversation.id, {
          unreadCount: conversation.unreadCount,
          lastMessageAt: conversation.lastMessageAt,
        });

        const previous = previousSnapshot.get(conversation.id);

        if (!previous) {
          continue;
        }

        const unreadIncreased = conversation.unreadCount > previous.unreadCount;
        const activityChanged =
          conversation.lastMessageAt !== previous.lastMessageAt &&
          conversation.unreadCount > 0;

        if (unreadIncreased || activityChanged) {
          notifyInboundMessage({
            messageId: `poll-${conversation.id}-${conversation.lastMessageAt}`,
            conversationId: conversation.id,
            senderName: conversation.partner.name,
            sentAt: conversation.lastMessageAt,
          });
        }
      }

      conversationSnapshotRef.current = nextSnapshot;
      setConversations(payload.conversations);
      partnerNamesRef.current = new Map(
        payload.conversations.map((conversation) => [
          conversation.id,
          conversation.partner.name,
        ]),
      );
    } finally {
      setIsLoadingConversations(false);
    }
  }, [notifyInboundMessage, viewerId]);

  const notifyConversationListeners = useCallback(
    (payload: MessageNewEventPayload) => {
      const listeners = listenersRef.current.get(payload.conversationId);

      listeners?.forEach((listener) => {
        listener(payload);
      });
    },
    [],
  );

  const handleIncomingMessage = useCallback(
    (payload: MessageNewEventPayload) => {
      realtimeLog("message:new received", {
        messageId: payload.messageId,
        conversationId: payload.conversationId,
      });

      const currentViewerId = viewerIdRef.current;
      const currentActiveConversationId = activeConversationIdRef.current;

      if (!currentViewerId) {
        return;
      }

      notifyConversationListeners(payload);

      const isOwnMessage = payload.senderId === currentViewerId;
      const isActiveConversation =
        currentActiveConversationId === payload.conversationId;
      const isDocumentVisible = document.visibilityState === "visible";
      const isDocumentFocused = document.hasFocus();
      // Two Chrome profiles can both be "visible" side-by-side — require focus
      // so the background profile still gets desktop alerts.
      const isActivelyViewingConversation =
        isActiveConversation && isDocumentVisible && isDocumentFocused;

      setConversations((current) => {
        const existing = current.find(
          (conversation) => conversation.id === payload.conversationId,
        );

        if (!existing) {
          void refreshConversations();
          return current;
        }

        return current.map((conversation) => {
          if (conversation.id !== payload.conversationId) {
            return conversation;
          }

          return {
            ...conversation,
            lastMessage: payload.text,
            lastMessageAt: payload.sentAt,
            unreadCount:
              isOwnMessage || isActivelyViewingConversation
                ? conversation.unreadCount
                : conversation.unreadCount + 1,
          };
        });
      });

      if (isOwnMessage) {
        return;
      }

      if (isActivelyViewingConversation) {
        void markConversationRead(payload.conversationId);
        return;
      }

      const partnerName =
        partnerNamesRef.current.get(payload.conversationId) ?? "A founder";

      notifyInboundMessage({
        messageId: payload.messageId,
        conversationId: payload.conversationId,
        senderName: partnerName,
        sentAt: payload.sentAt,
        senderId: payload.senderId,
      });
    },
    [notifyConversationListeners, notifyInboundMessage, refreshConversations],
  );

  useEffect(() => {
    handleIncomingMessageRef.current = handleIncomingMessage;
  }, [handleIncomingMessage]);

  const subscribeToConversation = useCallback(
    (conversationId: string, listener: MessageListener) => {
      const listeners = listenersRef.current.get(conversationId) ?? new Set();
      listeners.add(listener);
      listenersRef.current.set(conversationId, listeners);

      return () => {
        const current = listenersRef.current.get(conversationId);

        if (!current) {
          return;
        }

        current.delete(listener);

        if (current.size === 0) {
          listenersRef.current.delete(conversationId);
        }
      };
    },
    [],
  );

  useEffect(() => {
    void refreshConversations();
  }, [refreshConversations]);

  useEffect(() => {
    if (activeConversationId) {
      void refreshConversations();
    }
  }, [activeConversationId, refreshConversations]);

  useEffect(() => {
    if (!viewerId || !pusherReady) {
      return;
    }

    const pusher = getPusherClient();

    if (!pusher) {
      return;
    }

    const userChannelName = getUserChannelName(viewerId);

    if (userChannelRef.current !== userChannelName) {
      if (userChannelRef.current) {
        const previousChannel = pusher.channel(userChannelRef.current);

        if (previousChannel) {
          previousChannel.unbind(PUSHER_MESSAGE_NEW_EVENT);
        }

        pusher.unsubscribe(userChannelRef.current);
      }

      realtimeLog(`subscribing to ${userChannelName}`);

      const userChannel = pusher.subscribe(userChannelName);

      userChannel.bind("pusher:subscription_succeeded", () => {
        realtimeLog("subscription succeeded", { channel: userChannelName });
      });

      userChannel.bind("pusher:subscription_error", (status: unknown) => {
        realtimeError("subscription error", {
          channel: userChannelName,
          status:
            typeof status === "object" && status !== null && "error" in status
              ? String((status as { error?: unknown }).error)
              : "unknown",
        });
      });

      userChannel.bind(PUSHER_MESSAGE_NEW_EVENT, (payload: MessageNewEventPayload) => {
        handleIncomingMessageRef.current(payload);
      });

      userChannelRef.current = userChannelName;
    }
  }, [pusherReady, viewerId]);

  useEffect(() => {
    if (!viewerId || !pusherReady) {
      return;
    }

    const pusher = getPusherClient();

    if (!pusher) {
      return;
    }

    const desiredChannels = new Set<string>();

    for (const conversation of conversations) {
      desiredChannels.add(getChatChannelName(conversation.id));
    }

    if (activeConversationId) {
      desiredChannels.add(getChatChannelName(activeConversationId));
    }

    for (const channelName of desiredChannels) {
      if (subscribedChannelsRef.current.has(channelName)) {
        continue;
      }

      realtimeLog(`subscribing to ${channelName}`);

      const channel = pusher.subscribe(channelName);

      channel.bind("pusher:subscription_succeeded", () => {
        realtimeLog("subscription succeeded", { channel: channelName });
      });

      channel.bind("pusher:subscription_error", (status: unknown) => {
        realtimeError("subscription error", {
          channel: channelName,
          status:
            typeof status === "object" && status !== null && "error" in status
              ? String((status as { error?: unknown }).error)
              : "unknown",
        });
      });

      channel.bind(PUSHER_MESSAGE_NEW_EVENT, (payload: MessageNewEventPayload) => {
        handleIncomingMessageRef.current(payload);
      });

      subscribedChannelsRef.current.add(channelName);
    }

    for (const channelName of [...subscribedChannelsRef.current]) {
      if (desiredChannels.has(channelName)) {
        continue;
      }

      const channel = pusher.channel(channelName);

      if (channel) {
        channel.unbind(PUSHER_MESSAGE_NEW_EVENT);
      }

      pusher.unsubscribe(channelName);
      subscribedChannelsRef.current.delete(channelName);
    }
  }, [activeConversationId, conversations, pusherReady, viewerId]);

  useEffect(() => {
    const subscribedChannels = subscribedChannelsRef.current;

    return () => {
      const pusher = getPusherClient();

      if (!pusher) {
        return;
      }

      for (const channelName of subscribedChannels) {
        pusher.unsubscribe(channelName);
      }

      subscribedChannels.clear();
    };
  }, []);

  useMessagingPoll(() => refreshConversations(), {
    enabled: Boolean(viewerId) && MESSAGING_POLL_ENABLED,
    intervalMs: pusherReady ? 10_000 : MESSAGING_POLL_INTERVAL_MS,
  });

  const visibleConversations = useMemo(() => {
    if (!activeConversationId) {
      return conversations;
    }

    return conversations.map((conversation) =>
      conversation.id === activeConversationId
        ? { ...conversation, unreadCount: 0 }
        : conversation,
    );
  }, [activeConversationId, conversations]);

  const totalUnreadCount = useMemo(
    () =>
      visibleConversations.reduce(
        (total, conversation) => total + conversation.unreadCount,
        0,
      ),
    [visibleConversations],
  );

  const value = useMemo(
    () => ({
      conversations: visibleConversations,
      totalUnreadCount,
      isLoadingConversations: viewerId ? isLoadingConversations : false,
      refreshConversations,
      subscribeToConversation,
      activeConversationId,
      isRealtimeEnabled: pusherReady,
    }),
    [
      activeConversationId,
      isLoadingConversations,
      pusherReady,
      refreshConversations,
      subscribeToConversation,
      totalUnreadCount,
      viewerId,
      visibleConversations,
    ],
  );

  return (
    <MessagingRealtimeContext.Provider value={value}>
      {children}
    </MessagingRealtimeContext.Provider>
  );
}

export function useMessagingRealtime(): MessagingRealtimeContextValue {
  const context = useContext(MessagingRealtimeContext);

  if (!context) {
    throw new Error(
      "useMessagingRealtime must be used within MessagingRealtimeProvider",
    );
  }

  return context;
}

export function useOptionalMessagingRealtime():
  | MessagingRealtimeContextValue
  | null {
  return useContext(MessagingRealtimeContext);
}
