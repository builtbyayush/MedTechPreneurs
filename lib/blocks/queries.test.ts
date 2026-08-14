import { beforeEach, describe, expect, it, vi } from "vitest";

const connectDB = vi.fn();
const findOne = vi.fn();
const find = vi.fn();
const findOneAndUpdate = vi.fn();
const deleteOne = vi.fn();
const userFindById = vi.fn();
const userFind = vi.fn();

vi.mock("@/lib/db", () => ({
  connectDB: (...args: unknown[]) => connectDB(...args),
}));

vi.mock("@/models/Block", () => ({
  Block: {
    findOne: (...args: unknown[]) => findOne(...args),
    find: (...args: unknown[]) => find(...args),
    findOneAndUpdate: (...args: unknown[]) => findOneAndUpdate(...args),
    deleteOne: (...args: unknown[]) => deleteOne(...args),
  },
}));

vi.mock("@/models/User", () => ({
  User: {
    findById: (...args: unknown[]) => userFindById(...args),
    find: (...args: unknown[]) => userFind(...args),
  },
}));

import {
  assertNotBlocked,
  BlockError,
  blockUser,
  getBlockedRelationshipUserIds,
  getBlockedUsersForBlocker,
  isBlockedBetween,
  unblockUser,
} from "@/lib/blocks/queries";

const USER_A = "aaaaaaaaaaaaaaaaaaaaaaaa";
const USER_B = "bbbbbbbbbbbbbbbbbbbbbbbb";
const USER_C = "cccccccccccccccccccccccc";

function leanChain<T>(value: T) {
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

describe("block queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectDB.mockResolvedValue(undefined);
  });

  it("blocks user B for user A", async () => {
    userFindById.mockReturnValue(leanChain({ _id: USER_B }));
    findOneAndUpdate.mockResolvedValue({
      _id: { toString: () => "block-1" },
      blockerId: { toString: () => USER_A },
      blockedId: { toString: () => USER_B },
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const result = await blockUser(USER_A, USER_B);

    expect(result.blockerId).toBe(USER_A);
    expect(result.blockedId).toBe(USER_B);
    expect(findOneAndUpdate).toHaveBeenCalled();
  });

  it("handles duplicate blocks idempotently", async () => {
    userFindById.mockReturnValue(leanChain({ _id: USER_B }));
    findOneAndUpdate.mockResolvedValue({
      _id: { toString: () => "block-1" },
      blockerId: { toString: () => USER_A },
      blockedId: { toString: () => USER_B },
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const first = await blockUser(USER_A, USER_B);
    const second = await blockUser(USER_A, USER_B);

    expect(first.id).toBe(second.id);
  });

  it("rejects self-blocking", async () => {
    await expect(blockUser(USER_A, USER_A)).rejects.toMatchObject({
      name: "BlockError",
      message: "You cannot block yourself.",
      status: 400,
    });
  });

  it("unblocks a user the blocker blocked", async () => {
    deleteOne.mockResolvedValue({ deletedCount: 1 });

    await expect(unblockUser(USER_A, USER_B)).resolves.toBeUndefined();
    expect(deleteOne).toHaveBeenCalled();
  });

  it("returns 404 when unblocking a missing block", async () => {
    deleteOne.mockResolvedValue({ deletedCount: 0 });

    await expect(unblockUser(USER_A, USER_B)).rejects.toMatchObject({
      name: "BlockError",
      status: 404,
    });
  });

  it("detects blocks in both directions", async () => {
    findOne.mockReturnValue(leanChain({ _id: "block-1" }));
    await expect(isBlockedBetween(USER_A, USER_B)).resolves.toBe(true);

    findOne.mockReturnValue(leanChain(null));
    await expect(isBlockedBetween(USER_A, USER_B)).resolves.toBe(false);
  });

  it("assertNotBlocked throws when a block exists", async () => {
    findOne.mockReturnValue(leanChain({ _id: "block-1" }));

    await expect(assertNotBlocked(USER_A, USER_B)).rejects.toBeInstanceOf(
      BlockError,
    );
  });

  it("returns bidirectional blocked relationship ids", async () => {
    find.mockReturnValue(
      leanChain([
        {
          blockerId: { toString: () => USER_A },
          blockedId: { toString: () => USER_B },
        },
        {
          blockerId: { toString: () => USER_C },
          blockedId: { toString: () => USER_A },
        },
      ]),
    );

    const ids = await getBlockedRelationshipUserIds(USER_A);
    expect(ids.sort()).toEqual([USER_B, USER_C].sort());
  });

  it("lists blocked users for settings", async () => {
    find.mockReturnValue(
      leanChain([
        {
          blockedId: { toString: () => USER_B },
          createdAt: new Date("2026-01-02T00:00:00.000Z"),
        },
      ]),
    );
    userFind.mockReturnValue(
      leanChain([
        {
          _id: { toString: () => USER_B },
          name: "Blocked Founder",
          profilePhotoUrl: null,
        },
      ]),
    );

    const list = await getBlockedUsersForBlocker(USER_A);
    expect(list).toEqual([
      {
        id: USER_B,
        name: "Blocked Founder",
        profilePhotoUrl: undefined,
        blockedAt: "2026-01-02T00:00:00.000Z",
      },
    ]);
  });
});
