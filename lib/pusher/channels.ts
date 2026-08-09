/** Prefix for private conversation channels — `private-chat-{conversationId}`. */
export const CHAT_CHANNEL_PREFIX = "private-chat-";

/** Prefix for per-user inbox channels — `private-user-{userId}`. */
export const USER_CHANNEL_PREFIX = "private-user-";

export function getChatChannelName(conversationId: string): string {
  return `${CHAT_CHANNEL_PREFIX}${conversationId}`;
}

export function parseChatChannelName(channelName: string): string | null {
  if (!channelName.startsWith(CHAT_CHANNEL_PREFIX)) {
    return null;
  }

  const conversationId = channelName.slice(CHAT_CHANNEL_PREFIX.length).trim();

  if (!conversationId) {
    return null;
  }

  return conversationId;
}

export function getUserChannelName(userId: string): string {
  return `${USER_CHANNEL_PREFIX}${userId}`;
}

export function parseUserChannelName(channelName: string): string | null {
  if (!channelName.startsWith(USER_CHANNEL_PREFIX)) {
    return null;
  }

  const userId = channelName.slice(USER_CHANNEL_PREFIX.length).trim();

  if (!userId) {
    return null;
  }

  return userId;
}
