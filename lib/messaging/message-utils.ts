import type { MessageListItem } from "@/types/messaging";
import type { MessageNewEventPayload } from "@/lib/pusher/events";

export function messageFromRealtimeEvent(
  payload: MessageNewEventPayload,
  viewerId: string,
): MessageListItem {
  return {
    id: payload.messageId,
    conversationId: payload.conversationId,
    senderId: payload.senderId,
    content: payload.text,
    messageType: payload.messageType,
    isRead: payload.senderId === viewerId,
    createdAt: payload.sentAt,
    isOwn: payload.senderId === viewerId,
  };
}

export function appendMessageIfNew(
  messages: MessageListItem[],
  nextMessage: MessageListItem,
): MessageListItem[] {
  if (messages.some((message) => message.id === nextMessage.id)) {
    return messages;
  }

  return [...messages, nextMessage];
}
