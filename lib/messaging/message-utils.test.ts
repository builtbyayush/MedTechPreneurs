import { describe, expect, it } from "vitest";

import {
  appendMessageIfNew,
  messageFromRealtimeEvent,
} from "@/lib/messaging/message-utils";

describe("message utils", () => {
  const payload = {
    messageId: "msg-1",
    conversationId: "conv-1",
    senderId: "user-b",
    text: "Hello there",
    sentAt: "2026-08-09T00:00:00.000Z",
    messageType: "text" as const,
  };

  it("maps realtime payloads into message list items", () => {
    const message = messageFromRealtimeEvent(payload, "user-a");

    expect(message).toMatchObject({
      id: "msg-1",
      content: "Hello there",
      isOwn: false,
      isRead: false,
    });
  });

  it("deduplicates messages by persisted message id", () => {
    const existing = [messageFromRealtimeEvent(payload, "user-a")];
    const duplicate = messageFromRealtimeEvent(payload, "user-a");

    expect(appendMessageIfNew(existing, duplicate)).toHaveLength(1);
  });

  it("appends new messages while preserving order", () => {
    const first = messageFromRealtimeEvent(payload, "user-a");
    const second = messageFromRealtimeEvent(
      {
        ...payload,
        messageId: "msg-2",
        text: "Follow up",
        sentAt: "2026-08-09T00:01:00.000Z",
      },
      "user-a",
    );

    const next = appendMessageIfNew([first], second);

    expect(next.map((message) => message.id)).toEqual(["msg-1", "msg-2"]);
  });
});
