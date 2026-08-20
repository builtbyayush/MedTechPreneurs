import { beforeEach, describe, expect, it, vi } from "vitest";

const discoveryActionFind = vi.fn();
const discoveryActionDeleteMany = vi.fn();
const getActiveMatchedUserIds = vi.fn();
const getBlockedRelationshipUserIds = vi.fn();

vi.mock("@/lib/db", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/models/DiscoveryAction", () => ({
  DiscoveryAction: {
    find: (...args: unknown[]) => discoveryActionFind(...args),
    deleteMany: (...args: unknown[]) => discoveryActionDeleteMany(...args),
  },
}));

vi.mock("@/lib/matching/queries", () => ({
  getActiveMatchedUserIds: (...args: unknown[]) => getActiveMatchedUserIds(...args),
}));

vi.mock("@/lib/blocks/queries", () => ({
  getBlockedRelationshipUserIds: (...args: unknown[]) =>
    getBlockedRelationshipUserIds(...args),
}));

function leanSelect<T>(value: T) {
  return {
    select: () => ({
      lean: () => Promise.resolve(value),
    }),
  };
}

describe("discovery reset eligibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getActiveMatchedUserIds.mockResolvedValue(["matched-user"]);
    getBlockedRelationshipUserIds.mockResolvedValue(["blocked-user"]);
    discoveryActionDeleteMany.mockResolvedValue({ deletedCount: 2 });
  });

  it("excludes connect actions, matches, and blocks after pass reset", async () => {
    discoveryActionFind.mockReturnValue(
      leanSelect([
        { targetUserId: { toString: () => "liked-user" } },
      ]),
    );

    const { resetPassedFounders, getExcludedTargetIds } = await import(
      "@/lib/discovery/queries"
    );

    await resetPassedFounders("viewer-1");

    expect(discoveryActionDeleteMany).toHaveBeenCalledWith({
      viewerId: "viewer-1",
      action: "pass",
    });

    const excluded = await getExcludedTargetIds("viewer-1");
    expect(excluded).toContain("liked-user");
    expect(excluded).toContain("matched-user");
    expect(excluded).toContain("blocked-user");
  });

  it("scopes reset deletion to the requesting viewer", async () => {
    const { resetPassedFounders } = await import("@/lib/discovery/queries");

    await resetPassedFounders("viewer-a");
    await resetPassedFounders("viewer-b");

    expect(discoveryActionDeleteMany).toHaveBeenNthCalledWith(1, {
      viewerId: "viewer-a",
      action: "pass",
    });
    expect(discoveryActionDeleteMany).toHaveBeenNthCalledWith(2, {
      viewerId: "viewer-b",
      action: "pass",
    });
  });
});
