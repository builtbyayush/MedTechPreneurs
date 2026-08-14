import { beforeEach, describe, expect, it, vi } from "vitest";

const connectDB = vi.fn();
const blockUser = vi.fn();
const findOne = vi.fn();
const create = vi.fn();
const userFindById = vi.fn();

vi.mock("@/lib/db", () => ({
  connectDB: (...args: unknown[]) => connectDB(...args),
}));

vi.mock("@/lib/blocks/queries", () => ({
  blockUser: (...args: unknown[]) => blockUser(...args),
}));

vi.mock("@/models/Report", () => ({
  Report: {
    findOne: (...args: unknown[]) => findOne(...args),
    create: (...args: unknown[]) => create(...args),
    find: vi.fn(),
    findById: vi.fn(),
    countDocuments: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock("@/models/User", () => ({
  User: {
    findById: (...args: unknown[]) => userFindById(...args),
    find: vi.fn(),
    findOne: vi.fn(),
    updateOne: vi.fn(),
  },
}));

import {
  createUserReportWithBlock,
  ReportError,
} from "@/lib/reports/queries";

const USER_A = "aaaaaaaaaaaaaaaaaaaaaaaa";
const USER_B = "bbbbbbbbbbbbbbbbbbbbbbbb";

function leanSelect<T>(value: T) {
  return {
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(value),
    }),
    lean: vi.fn().mockResolvedValue(value),
    sort: vi.fn().mockReturnThis(),
  };
}

describe("createUserReportWithBlock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectDB.mockResolvedValue(undefined);
    blockUser.mockResolvedValue({
      id: "block-1",
      blockerId: USER_A,
      blockedId: USER_B,
      createdAt: new Date().toISOString(),
    });
  });

  it("creates a report and auto-blocks the reported user", async () => {
    userFindById.mockReturnValue(
      leanSelect({ _id: USER_B, accountStatus: "active" }),
    );
    findOne.mockReturnValue({
      sort: vi.fn().mockResolvedValue(null),
    });
    create.mockResolvedValue({
      _id: { toString: () => "report-1" },
      reporterId: { toString: () => USER_A },
      reportedUserId: { toString: () => USER_B },
      reason: "harassment",
      description: "Abusive messages",
      status: "pending",
      action: "none",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const report = await createUserReportWithBlock(USER_A, USER_B, {
      reason: "harassment",
      description: "Abusive messages",
    });

    expect(report.id).toBe("report-1");
    expect(report.status).toBe("pending");
    expect(blockUser).toHaveBeenCalledWith(USER_A, USER_B);
  });

  it("rejects self-reports", async () => {
    await expect(
      createUserReportWithBlock(USER_A, USER_A, { reason: "spam" }),
    ).rejects.toBeInstanceOf(ReportError);
  });

  it("returns recent duplicate without creating another report", async () => {
    userFindById.mockReturnValue(
      leanSelect({ _id: USER_B, accountStatus: "active" }),
    );
    findOne.mockReturnValue({
      sort: vi.fn().mockResolvedValue({
        _id: { toString: () => "report-dup" },
        reporterId: { toString: () => USER_A },
        reportedUserId: { toString: () => USER_B },
        reason: "spam",
        status: "pending",
        action: "none",
        createdAt: new Date(),
      }),
    });

    const report = await createUserReportWithBlock(USER_A, USER_B, {
      reason: "spam",
    });

    expect(report.id).toBe("report-dup");
    expect(create).not.toHaveBeenCalled();
    expect(blockUser).toHaveBeenCalled();
  });

  it("succeeds even if block already exists", async () => {
    userFindById.mockReturnValue(
      leanSelect({ _id: USER_B, accountStatus: "active" }),
    );
    findOne.mockReturnValue({
      sort: vi.fn().mockResolvedValue(null),
    });
    create.mockResolvedValue({
      _id: { toString: () => "report-2" },
      reporterId: { toString: () => USER_A },
      reportedUserId: { toString: () => USER_B },
      reason: "fraud_or_scam",
      status: "pending",
      action: "none",
      createdAt: new Date(),
    });
    blockUser.mockRejectedValue(new Error("already blocked"));

    const report = await createUserReportWithBlock(USER_A, USER_B, {
      reason: "fraud_or_scam",
    });

    expect(report.id).toBe("report-2");
  });
});
