import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCompare = vi.fn();
const mockHash = vi.fn();
const mockFindById = vi.fn();
const mockFindByIdAndUpdate = vi.fn();

vi.mock("bcryptjs", () => ({
  compare: (...args: unknown[]) => mockCompare(...args),
  hash: (...args: unknown[]) => mockHash(...args),
}));

vi.mock("@/lib/db", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/models/User", () => ({
  User: {
    findById: (...args: unknown[]) => mockFindById(...args),
    findByIdAndUpdate: (...args: unknown[]) => mockFindByIdAndUpdate(...args),
  },
}));

describe("changePasswordForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindById.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ passwordHash: "existing-hash" }),
      }),
    });
    mockCompare.mockResolvedValue(true);
    mockHash.mockResolvedValue("new-hash");
    mockFindByIdAndUpdate.mockResolvedValue({});
  });

  it("rejects an incorrect current password", async () => {
    mockCompare.mockResolvedValue(false);

    const { changePasswordForUser, ChangePasswordError } = await import(
      "@/lib/settings/change-password"
    );

    await expect(
      changePasswordForUser("user-1", {
        currentPassword: "wrong",
        newPassword: "newpassword1",
      }),
    ).rejects.toMatchObject({
      message: "Current password is incorrect.",
      status: 401,
    });

    expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("updates the password hash when the current password matches", async () => {
    const { changePasswordForUser } = await import("@/lib/settings/change-password");

    await changePasswordForUser("user-1", {
      currentPassword: "oldpassword1",
      newPassword: "newpassword1",
    });

    expect(mockHash).toHaveBeenCalledWith("newpassword1", 12);
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith("user-1", {
      passwordHash: "new-hash",
    });
  });
});

describe("changePasswordSchema", () => {
  it("rejects mismatched confirmation passwords", async () => {
    const { changePasswordSchema } = await import("@/lib/validations/change-password");

    const parsed = changePasswordSchema.safeParse({
      currentPassword: "oldpassword1",
      newPassword: "newpassword1",
      confirmPassword: "different1",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects reusing the current password as the new password", async () => {
    const { changePasswordSchema } = await import("@/lib/validations/change-password");

    const parsed = changePasswordSchema.safeParse({
      currentPassword: "samepassword",
      newPassword: "samepassword",
      confirmPassword: "samepassword",
    });

    expect(parsed.success).toBe(false);
  });
});
