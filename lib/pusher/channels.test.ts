import { describe, expect, it } from "vitest";

import {
  CHAT_CHANNEL_PREFIX,
  getChatChannelName,
  getUserChannelName,
  parseChatChannelName,
  parseUserChannelName,
  USER_CHANNEL_PREFIX,
} from "@/lib/pusher/channels";

describe("pusher channels", () => {
  it("builds deterministic conversation channel names", () => {
    expect(getChatChannelName("abc123")).toBe(`${CHAT_CHANNEL_PREFIX}abc123`);
  });

  it("builds deterministic user channel names", () => {
    expect(getUserChannelName("user-a")).toBe(`${USER_CHANNEL_PREFIX}user-a`);
  });

  it("parses valid conversation channel names", () => {
    expect(parseChatChannelName("private-chat-abc123")).toBe("abc123");
  });

  it("parses valid user channel names", () => {
    expect(parseUserChannelName("private-user-user-a")).toBe("user-a");
  });

  it("rejects invalid channel names", () => {
    expect(parseChatChannelName("public-chat-abc123")).toBeNull();
    expect(parseChatChannelName("private-chat-")).toBeNull();
  });
});
