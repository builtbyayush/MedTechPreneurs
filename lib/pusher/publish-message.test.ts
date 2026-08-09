import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/pusher/realtime-log", () => ({
  realtimeServerLog: vi.fn(),
  realtimeServerError: vi.fn(),
}));

const trigger = vi.fn();
const authorizeChannel = vi.fn();

vi.mock("@/lib/pusher/server", () => ({
  getPusherServer: () => ({
    trigger,
    authorizeChannel,
  }),
  isPusherConfigured: () => true,
}));

vi.mock("@/lib/messaging/queries", () => ({
  getConversationForUser: vi.fn(),
}));

import { getConversationForUser } from "@/lib/messaging/queries";
import { authorizeChatChannel, authorizePusherChannel, authorizeUserChannel } from "@/lib/pusher/auth";
import { publishNewMessageEvent } from "@/lib/pusher/publish-message";

describe("pusher auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authorizeChannel.mockReturnValue({ auth: "signed-auth" });
  });

  it("denies subscriptions to invalid channel names", async () => {
    const result = await authorizeChatChannel({
      userId: "user-a",
      channelName: "public-chat-123",
      socketId: "1.1",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("invalid_channel");
    }
  });

  it("denies subscriptions when the user is not a participant", async () => {
    vi.mocked(getConversationForUser).mockResolvedValue(null);

    const result = await authorizeChatChannel({
      userId: "user-a",
      channelName: "private-chat-conv-1",
      socketId: "1.1",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("conversation_not_found");
    }
  });

  it("authorizes matched participants for private chat channels", async () => {
    vi.mocked(getConversationForUser).mockResolvedValue({
      _id: { toString: () => "conv-1" } as never,
      participants: [] as never,
      matchId: { toString: () => "match-1" } as never,
    });

    const result = await authorizeChatChannel({
      userId: "user-a",
      channelName: "private-chat-conv-1",
      socketId: "1.1",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.auth.auth).toBe("signed-auth");
    }
  });

  it("authorizes a user's private inbox channel", async () => {
    const result = await authorizeUserChannel({
      userId: "user-a",
      channelName: "private-user-user-a",
      socketId: "1.1",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.auth.auth).toBe("signed-auth");
    }
  });

  it("denies inbox channel subscriptions for other users", async () => {
    const result = await authorizeUserChannel({
      userId: "user-a",
      channelName: "private-user-user-b",
      socketId: "1.1",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("forbidden");
    }
  });

  it("routes user channels through authorizePusherChannel", async () => {
    const result = await authorizePusherChannel({
      userId: "user-a",
      channelName: "private-user-user-a",
      socketId: "1.1",
    });

    expect(result.ok).toBe(true);
  });
});

describe("publishNewMessageEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    trigger.mockResolvedValue(undefined);
  });

  it("publishes after persistence with the expected payload shape", async () => {
    const published = await publishNewMessageEvent({
      messageId: "msg-1",
      conversationId: "conv-1",
      senderId: "user-a",
      recipientId: "user-b",
      text: "Hello",
      sentAt: "2026-08-09T00:00:00.000Z",
      messageType: "text",
    });

    expect(published).toBe(true);
    expect(trigger).toHaveBeenCalledTimes(2);
    expect(trigger).toHaveBeenCalledWith(
      "private-chat-conv-1",
      "message:new",
      expect.objectContaining({
        messageId: "msg-1",
        conversationId: "conv-1",
        senderId: "user-a",
        text: "Hello",
      }),
    );
    expect(trigger).toHaveBeenCalledWith(
      "private-user-user-b",
      "message:new",
      expect.objectContaining({
        messageId: "msg-1",
      }),
    );
  });

  it("returns false without throwing when publish fails", async () => {
    trigger.mockRejectedValue(new Error("network failure"));

    const published = await publishNewMessageEvent({
      messageId: "msg-2",
      conversationId: "conv-2",
      senderId: "user-b",
      text: "Still saved",
      sentAt: "2026-08-09T00:00:00.000Z",
      messageType: "text",
    });

    expect(published).toBe(false);
  });
});
