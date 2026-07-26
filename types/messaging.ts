import type { MESSAGE_TYPES } from "@/models/Message";

export type MessageType = (typeof MESSAGE_TYPES)[number];

export type ConversationPartner = {
  id: string;
  name: string;
  headline?: string;
  profilePhotoUrl?: string;
};

export type ConversationListItem = {
  id: string;
  partner: ConversationPartner;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

export type ConversationListResponse = {
  conversations: ConversationListItem[];
};

export type MessageListItem = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  isRead: boolean;
  createdAt: string;
  isOwn: boolean;
};

export type MessageListResponse = {
  messages: MessageListItem[];
  partner: ConversationPartner;
};

export type SendMessageResponse = {
  ok: true;
  message: MessageListItem;
};
