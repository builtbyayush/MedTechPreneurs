import { beforeEach, describe, expect, it, vi } from "vitest";

const connectDB = vi.fn();
const findById = vi.fn();
const userUpdateOne = vi.fn();
const userFindById = vi.fn();

vi.mock("@/lib/db", () => ({
  connectDB: (...args: unknown[]) => connectDB(...args),
}));

vi.mock("@/lib/blocks/queries", () => ({
  blockUser: vi.fn(),
}));

vi.mock("@/models/Report", () => ({
  Report: {
    findById: (...args: unknown[]) => findById(...args),
  },
}));

vi.mock("@/models/User", () => ({
  User: {
    updateOne: (...args: unknown[]) => userUpdateOne(...args),
    findById: (...args: unknown[]) => userFindById(...args),
  },
}));

import { requireAdmin, AccountAccessError } from "@/lib/auth/account";
import { reviewReport, ReportError } from "@/lib/reports/queries";

const REPORT_ID = "cccccccccccccccccccccccc";
const ADMIN_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const USER_ID = "bbbbbbbbbbbbbbbbbbbbbbbb";

describe("moderation review", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectDB.mockResolvedValue(undefined);
    userUpdateOne.mockResolvedValue({ acknowledged: true });
  });

  it("dismisses a pending report with audit fields", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    findById.mockResolvedValue({
      _id: { toString: () => REPORT_ID },
      reporterId: { toString: () => ADMIN_ID },
      reportedUserId: { toString: () => USER_ID },
      reason: "spam",
      status: "pending",
      action: "none",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      save,
    });

    const report = await reviewReport({
      reportId: REPORT_ID,
      adminId: ADMIN_ID,
      review: { action: "dismissed", adminNotes: "Not actionable" },
    });

    expect(report.status).toBe("reviewed");
    expect(report.action).toBe("dismissed");
    expect(report.reviewedBy).toBe(ADMIN_ID);
    expect(report.adminNotes).toBe("Not actionable");
    expect(save).toHaveBeenCalled();
  });

  it("records a warning on the reported user", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    findById.mockResolvedValue({
      _id: { toString: () => REPORT_ID },
      reporterId: { toString: () => ADMIN_ID },
      reportedUserId: { toString: () => USER_ID },
      reason: "harassment",
      status: "pending",
      action: "none",
      createdAt: new Date(),
      save,
    });

    await reviewReport({
      reportId: REPORT_ID,
      adminId: ADMIN_ID,
      review: { action: "warning" },
    });

    expect(userUpdateOne).toHaveBeenCalled();
    const update = userUpdateOne.mock.calls[0]?.[1] as {
      $inc?: { moderationWarningCount?: number };
    };
    expect(update.$inc?.moderationWarningCount).toBe(1);
  });

  it("suspends the reported user", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    findById.mockResolvedValue({
      _id: { toString: () => REPORT_ID },
      reporterId: { toString: () => ADMIN_ID },
      reportedUserId: { toString: () => USER_ID },
      reason: "fraud_or_scam",
      status: "pending",
      action: "none",
      createdAt: new Date(),
      save,
    });

    await reviewReport({
      reportId: REPORT_ID,
      adminId: ADMIN_ID,
      review: { action: "suspension", suspensionDuration: "7d" },
    });

    const update = userUpdateOne.mock.calls[0]?.[1] as {
      $set?: { accountStatus?: string; isActive?: boolean };
    };
    expect(update.$set?.accountStatus).toBe("suspended");
    expect(update.$set?.isActive).toBe(false);
  });

  it("bans the reported user", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    findById.mockResolvedValue({
      _id: { toString: () => REPORT_ID },
      reporterId: { toString: () => ADMIN_ID },
      reportedUserId: { toString: () => USER_ID },
      reason: "impersonation",
      status: "pending",
      action: "none",
      createdAt: new Date(),
      save,
    });

    await reviewReport({
      reportId: REPORT_ID,
      adminId: ADMIN_ID,
      review: { action: "ban", adminNotes: "Confirmed fake profile" },
    });

    const update = userUpdateOne.mock.calls[0]?.[1] as {
      $set?: { accountStatus?: string; isActive?: boolean };
    };
    expect(update.$set?.accountStatus).toBe("banned");
    expect(update.$set?.isActive).toBe(false);
  });

  it("rejects reviewing an already reviewed report", async () => {
    findById.mockResolvedValue({
      _id: { toString: () => REPORT_ID },
      status: "reviewed",
      action: "dismissed",
      save: vi.fn(),
    });

    await expect(
      reviewReport({
        reportId: REPORT_ID,
        adminId: ADMIN_ID,
        review: { action: "ban" },
      }),
    ).rejects.toMatchObject({
      name: "ReportError",
      status: 409,
    });
  });
});

describe("requireAdmin authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectDB.mockResolvedValue(undefined);
  });

  it("allows admin users", async () => {
    userFindById.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ role: "admin" }),
      }),
    });

    await expect(requireAdmin(ADMIN_ID)).resolves.toEqual({
      id: ADMIN_ID,
      role: "admin",
    });
  });

  it("rejects non-admin users", async () => {
    userFindById.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ role: "user" }),
      }),
    });

    await expect(requireAdmin(USER_ID)).rejects.toBeInstanceOf(
      AccountAccessError,
    );
  });
});
