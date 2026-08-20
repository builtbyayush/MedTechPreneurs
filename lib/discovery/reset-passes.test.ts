import { beforeEach, describe, expect, it, vi } from "vitest";

const mockDeleteMany = vi.fn();

vi.mock("@/lib/db", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/models/DiscoveryAction", () => ({
  DiscoveryAction: {
    deleteMany: (...args: unknown[]) => mockDeleteMany(...args),
  },
}));

describe("resetPassedFounders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteMany.mockResolvedValue({ deletedCount: 2 });
  });

  it("deletes only pass actions for the viewer", async () => {
    const { resetPassedFounders, resetRejectedDiscoveryProfiles } =
      await import("@/lib/discovery/queries");

    const resetCount = await resetPassedFounders("viewer-1");

    expect(resetCount).toBe(2);
    expect(mockDeleteMany).toHaveBeenCalledWith({
      viewerId: "viewer-1",
      action: "pass",
    });
    expect(resetRejectedDiscoveryProfiles).toBe(resetPassedFounders);
  });

  it("succeeds gracefully when there is nothing to restore", async () => {
    mockDeleteMany.mockResolvedValue({ deletedCount: 0 });

    const { resetPassedFounders } = await import("@/lib/discovery/queries");
    await expect(resetPassedFounders("viewer-1")).resolves.toBe(0);
  });
});
