import "server-only";

import { getChatChannelName, getUserChannelName } from "@/lib/pusher/channels";
import {
  PUSHER_MESSAGE_NEW_EVENT,
  type MessageNewEventPayload,
} from "@/lib/pusher/events";
import {
  realtimeServerError,
  realtimeServerLog,
} from "@/lib/pusher/realtime-log";
import { getPusherServer } from "@/lib/pusher/server";

export async function publishNewMessageEvent(
  payload: MessageNewEventPayload & { recipientId?: string },
): Promise<boolean> {
  const pusher = getPusherServer();

  if (!pusher) {
    realtimeServerError("publish failure", { reason: "server not configured" });
    return false;
  }

  const chatChannel = getChatChannelName(payload.conversationId);
  const userChannel = payload.recipientId
    ? getUserChannelName(payload.recipientId)
    : null;

  realtimeServerLog("publishing message:new", {
    messageId: payload.messageId,
    conversationId: payload.conversationId,
    channel: chatChannel,
    userChannel: userChannel ?? undefined,
    event: PUSHER_MESSAGE_NEW_EVENT,
  });

  try {
    const triggers = [
      pusher.trigger(chatChannel, PUSHER_MESSAGE_NEW_EVENT, payload),
    ];

    if (userChannel) {
      triggers.push(
        pusher.trigger(userChannel, PUSHER_MESSAGE_NEW_EVENT, payload),
      );
    }

    await Promise.all(triggers);

    realtimeServerLog("publish success", {
      messageId: payload.messageId,
      conversationId: payload.conversationId,
    });

    return true;
  } catch (error) {
    realtimeServerError("publish failure", {
      messageId: payload.messageId,
      conversationId: payload.conversationId,
      error: error instanceof Error ? error.message : "unknown",
    });

    return false;
  }
}
