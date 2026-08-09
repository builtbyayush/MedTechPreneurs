import "server-only";

import {
  parseChatChannelName,
  parseUserChannelName,
} from "@/lib/pusher/channels";
import { getPusherServer } from "@/lib/pusher/server";
import { getConversationForUser } from "@/lib/messaging/queries";

type AuthorizeChatChannelInput = {
  userId: string;
  channelName: string;
  socketId: string;
};

type AuthorizeChatChannelSuccess = {
  ok: true;
  auth: {
    auth: string;
    channel_data?: string;
  };
};

type AuthorizeChatChannelFailure = {
  ok: false;
  reason:
    | "invalid_channel"
    | "conversation_not_found"
    | "forbidden"
    | "pusher_not_configured";
};

export type AuthorizeChatChannelResult =
  | AuthorizeChatChannelSuccess
  | AuthorizeChatChannelFailure;

export async function authorizeUserChannel(input: {
  userId: string;
  channelName: string;
  socketId: string;
}): Promise<AuthorizeChatChannelResult> {
  const channelUserId = parseUserChannelName(input.channelName);

  if (!channelUserId) {
    return { ok: false, reason: "invalid_channel" };
  }

  if (channelUserId !== input.userId) {
    return { ok: false, reason: "forbidden" };
  }

  const pusher = getPusherServer();

  if (!pusher) {
    return { ok: false, reason: "pusher_not_configured" };
  }

  const auth = pusher.authorizeChannel(input.socketId, input.channelName);

  return { ok: true, auth };
}

export async function authorizePusherChannel(input: {
  userId: string;
  channelName: string;
  socketId: string;
}): Promise<AuthorizeChatChannelResult> {
  if (parseUserChannelName(input.channelName)) {
    return authorizeUserChannel(input);
  }

  return authorizeChatChannel(input);
}

export async function authorizeChatChannel(
  input: AuthorizeChatChannelInput,
): Promise<AuthorizeChatChannelResult> {
  const conversationId = parseChatChannelName(input.channelName);

  if (!conversationId) {
    return { ok: false, reason: "invalid_channel" };
  }

  const conversation = await getConversationForUser({
    conversationId,
    userId: input.userId,
  });

  if (!conversation) {
    return { ok: false, reason: "conversation_not_found" };
  }

  const pusher = getPusherServer();

  if (!pusher) {
    return { ok: false, reason: "pusher_not_configured" };
  }

  const auth = pusher.authorizeChannel(input.socketId, input.channelName);

  return { ok: true, auth };
}
