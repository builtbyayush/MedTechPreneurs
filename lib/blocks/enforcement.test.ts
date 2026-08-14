import { beforeEach, describe, expect, it, vi } from "vitest";

const connectDB = vi.fn();
const isBlockedBetween = vi.fn();
const getBlockedRelationshipUserIds = vi.fn();
const assertNotBlocked = vi.fn();

vi.mock("@/lib/db", () => ({
  connectDB: (...args: unknown[]) => connectDB(...args),
}));

vi.mock("@/lib/blocks/queries", async () => {
  const actual = await vi.importActual<typeof import("@/lib/blocks/queries")>(
    "@/lib/blocks/queries",
  );

  return {
    ...actual,
    isBlockedBetween: (...args: unknown[]) => isBlockedBetween(...args),
    getBlockedRelationshipUserIds: (...args: unknown[]) =>
      getBlockedRelationshipUserIds(...args),
    assertNotBlocked: (...args: unknown[]) => assertNotBlocked(...args),
  };
});

const conversationFindOne = vi.fn();
const matchFindOne = vi.fn();
const matchFind = vi.fn();
const conversationFind = vi.fn();
const discoveryActionFind = vi.fn();
const getActiveMatchedUserIds = vi.fn();

vi.mock("@/models/Conversation", () => ({
  Conversation: {
    findOne: (...args: unknown[]) => conversationFindOne(...args),
    find: (...args: unknown[]) => conversationFind(...args),
  },
  getConversationPartnerId: (
    conversation: { participants: { toString(): string }[] },
    viewerId: string,
  ) =>
    conversation.participants
      .map((participant) => participant.toString())
      .find((id) => id !== viewerId)!,
  getConversationParticipantKey: () => "key",
}));

vi.mock("@/models/Match", () => ({
  Match: {
    findOne: (...args: unknown[]) => matchFindOne(...args),
    find: (...args: unknown[]) => matchFind(...args),
  },
  getCanonicalMatchPair: (a: string, b: string) => [a, b].sort(),
  getMatchPartnerId: (
    match: { userA: { toString(): string }; userB: { toString(): string } },
    userId: string,
  ) => {
    const a = match.userA.toString();
    const b = match.userB.toString();
    return a === userId ? b : a;
  },
}));

vi.mock("@/models/Message", () => ({
  Message: {
    findOne: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
    aggregate: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock("@/models/User", () => ({
  User: {
    findById: vi.fn(),
    find: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      }),
    }),
    findOne: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock("@/models/DiscoveryAction", () => ({
  DiscoveryAction: {
    find: (...args: unknown[]) => discoveryActionFind(...args),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock("@/lib/matching/queries", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/matching/queries")>(
      "@/lib/matching/queries",
    );
  return {
    ...actual,
    getActiveMatchedUserIds: (...args: unknown[]) =>
      getActiveMatchedUserIds(...args),
  };
});

import { BlockError } from "@/lib/blocks/queries";
import { getExcludedTargetIds } from "@/lib/discovery/queries";
import {
  getConversationForUser,
  getConversationsForUser,
  sendMessage,
} from "@/lib/messaging/queries";
import { recordDiscoveryAction } from "@/lib/discovery/queries";
import { sendIntroduction } from "@/lib/matching/intro";

const USER_A = "aaaaaaaaaaaaaaaaaaaaaaaa";
const USER_B = "bbbbbbbbbbbbbbbbbbbbbbbb";

function leanSelect<T>(value: T) {
  return {
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(value),
    }),
    lean: vi.fn().mockResolvedValue(value),
    sort: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(value),
    }),
  };
}

describe("block enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectDB.mockResolvedValue(undefined);
    getActiveMatchedUserIds.mockResolvedValue([]);
  });

  it("hides conversations when either participant blocked the other", async () => {
    conversationFindOne.mockReturnValue(
      leanSelect({
        _id: { toString: () => "conv-1" },
        participants: [
          { toString: () => USER_A },
          { toString: () => USER_B },
        ],
        matchId: { toString: () => "match-1" },
      }),
    );
    matchFindOne.mockReturnValue(leanSelect({ _id: "match-1" }));
    isBlockedBetween.mockResolvedValue(true);

    await expect(
      getConversationForUser({ conversationId: "conv-1", userId: USER_A }),
    ).resolves.toBeNull();
  });

  it("allows conversations when no block exists", async () => {
    conversationFindOne.mockReturnValue(
      leanSelect({
        _id: { toString: () => "conv-1" },
        participants: [
          { toString: () => USER_A },
          { toString: () => USER_B },
        ],
        matchId: { toString: () => "match-1" },
      }),
    );
    matchFindOne.mockReturnValue(leanSelect({ _id: "match-1" }));
    isBlockedBetween.mockResolvedValue(false);

    const conversation = await getConversationForUser({
      conversationId: "conv-1",
      userId: USER_A,
    });

    expect(conversation).not.toBeNull();
  });

  it("excludes blocked partners from conversation lists", async () => {
    matchFind.mockReturnValue(leanSelect([]));
    getBlockedRelationshipUserIds.mockResolvedValue([USER_B]);
    conversationFind.mockReturnValue(
      leanSelect([
        {
          _id: { toString: () => "conv-1" },
          participants: [
            { toString: () => USER_A },
            { toString: () => USER_B },
          ],
          matchId: { toString: () => "match-1" },
          lastMessage: "hi",
          lastMessageAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
    );

    // Second Match.find for active matches
    matchFind
      .mockReturnValueOnce(leanSelect([]))
      .mockReturnValueOnce(leanSelect([{ _id: { toString: () => "match-1" } }]));

    const list = await getConversationsForUser(USER_A);
    expect(list).toEqual([]);
  });

  it("rejects sendMessage for blocked conversations", async () => {
    conversationFindOne.mockReturnValue(
      leanSelect({
        _id: { toString: () => "conv-1" },
        participants: [
          { toString: () => USER_A },
          { toString: () => USER_B },
        ],
        matchId: { toString: () => "match-1" },
      }),
    );
    matchFindOne.mockReturnValue(leanSelect({ _id: "match-1" }));
    isBlockedBetween.mockResolvedValue(true);

    await expect(
      sendMessage({
        conversationId: "conv-1",
        userId: USER_A,
        content: "Hello",
      }),
    ).rejects.toThrow("Conversation not found");
  });

  it("includes blocked relationship ids in discovery exclusions", async () => {
    discoveryActionFind.mockReturnValue(
      leanSelect([{ targetUserId: { toString: () => "dddddddddddddddddddddddd" } }]),
    );
    getActiveMatchedUserIds.mockResolvedValue([]);
    getBlockedRelationshipUserIds.mockResolvedValue([USER_B]);

    const ids = await getExcludedTargetIds(USER_A);
    expect(ids).toContain(USER_B);
    expect(ids).toContain("dddddddddddddddddddddddd");
  });

  it("blocks discovery actions between blocked users", async () => {
    assertNotBlocked.mockRejectedValue(
      new BlockError("You cannot interact with this founder.", 403),
    );

    await expect(
      recordDiscoveryAction({
        viewerId: USER_A,
        targetUserId: USER_B,
        action: "connect",
      }),
    ).rejects.toBeInstanceOf(BlockError);
  });

  it("blocks introductions between blocked users", async () => {
    assertNotBlocked.mockRejectedValue(
      new BlockError("You cannot interact with this founder.", 403),
    );

    await expect(
      sendIntroduction({
        viewerId: USER_A,
        targetUserId: USER_B,
        content: "Hello founder",
      }),
    ).rejects.toBeInstanceOf(BlockError);
  });
});
