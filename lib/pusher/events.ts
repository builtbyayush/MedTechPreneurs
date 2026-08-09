import type { MessageType } from "@/types/messaging";

export const PUSHER_MESSAGE_NEW_EVENT = "message:new";

/** Real-time payload — minimal fields for client render + deduplication. */
export type MessageNewEventPayload = {
  messageId: string;
  conversationId: string;
  senderId: string;
  text: string;
  sentAt: string;
  messageType: MessageType;
};
