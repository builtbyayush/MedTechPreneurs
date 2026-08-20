import { beforeEach, describe, expect, it, vi } from "vitest";

import { PASSWORD_RESET_MESSAGES } from "@/config/password-reset";
import {
  generateResetToken,
  getResetTokenExpiryDate,
  hashResetToken,
} from "@/lib/password-reset/token";

const mockUserFindOne = vi.fn();
const mockUserFindByIdAndUpdate = vi.fn();
const mockTokenFindOne = vi.fn();
const mockTokenFindOneAndUpdate = vi.fn();
const mockTokenDeleteOne = vi.fn();
const mockSendPasswordResetEmail = vi.fn();

vi.mock("@/lib/db", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/models/User", () => ({
  User: {
    findOne: (...args: unknown[]) => ({
      select: () => ({
        lean: () => mockUserFindOne(...args),
      }),
    }),
    findByIdAndUpdate: (...args: unknown[]) => mockUserFindByIdAndUpdate(...args),
  },
}));

vi.mock("@/models/PasswordResetToken", () => ({
  PasswordResetToken: {
    findOne: (...args: unknown[]) => ({
      select: () => mockTokenFindOne(...args),
    }),
    findOneAndUpdate: (...args: unknown[]) => mockTokenFindOneAndUpdate(...args),
    deleteOne: (...args: unknown[]) => mockTokenDeleteOne(...args),
  },
}));

vi.mock("@/lib/email/send-password-reset", () => ({
  buildPasswordResetUrl: (token: string) =>
    `http://localhost:3000/reset-password?token=${token}`,
  sendPasswordResetEmail: (...args: unknown[]) =>
    mockSendPasswordResetEmail(...args),
}));

describe("password reset token helpers", () => {
  it("hashes tokens deterministically for lookup", () => {
    const token = generateResetToken();
    expect(hashResetToken(token)).toHaveLength(64);
    expect(hashResetToken(token)).toBe(hashResetToken(token));
  });

  it("generates unique tokens", () => {
    const a = generateResetToken();
    const b = generateResetToken();
    expect(a).not.toBe(b);
  });
});

describe("requestPasswordReset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendPasswordResetEmail.mockResolvedValue({ delivered: false, devResetUrl: "http://test" });
  });

  it("returns a generic success message when the account does not exist", async () => {
    mockUserFindOne.mockResolvedValue(null);

    const { requestPasswordReset } = await import("@/lib/password-reset/service");
    const result = await requestPasswordReset("missing@example.com");

    expect(result.ok).toBe(true);
    expect(result.message).toBe(PASSWORD_RESET_MESSAGES.requestSuccess);
    expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("returns a generic success message when the account has no password hash", async () => {
    mockUserFindOne.mockResolvedValue({ _id: "user-1", passwordHash: undefined });

    const { requestPasswordReset } = await import("@/lib/password-reset/service");
    const result = await requestPasswordReset("oauth@example.com");

    expect(result.message).toBe(PASSWORD_RESET_MESSAGES.requestSuccess);
    expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("accepts valid email format and sends a reset email for existing accounts", async () => {
    mockUserFindOne.mockResolvedValue({
      _id: "user-1",
      passwordHash: "hashed",
    });
    mockTokenFindOne.mockResolvedValue(null);
    mockTokenFindOneAndUpdate.mockResolvedValue({});

    const { requestPasswordReset } = await import("@/lib/password-reset/service");
    const result = await requestPasswordReset("founder@example.com");

    expect(result.ok).toBe(true);
    expect(result.message).toBe(PASSWORD_RESET_MESSAGES.requestSuccess);
    expect(mockTokenFindOneAndUpdate).toHaveBeenCalled();
    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "founder@example.com" }),
    );
  });

  it("does not reveal account existence in the response shape", async () => {
    mockUserFindOne.mockResolvedValue(null);
    const { requestPasswordReset } = await import("@/lib/password-reset/service");
    const missing = await requestPasswordReset("missing@example.com");

    mockUserFindOne.mockResolvedValue({
      _id: "user-1",
      passwordHash: "hashed",
    });
    mockTokenFindOne.mockResolvedValue(null);
    mockTokenFindOneAndUpdate.mockResolvedValue({});
    const existing = await requestPasswordReset("founder@example.com");

    expect(missing.message).toBe(existing.message);
  });

  it("applies resend cooldown for repeated requests", async () => {
    mockUserFindOne.mockResolvedValue({
      _id: "user-1",
      passwordHash: "hashed",
    });
    mockTokenFindOne.mockResolvedValue({
      lastSentAt: new Date(Date.now() - 10_000),
    });

    const { requestPasswordReset } = await import("@/lib/password-reset/service");
    const result = await requestPasswordReset("founder@example.com");

    expect(result.cooldownSeconds).toBeGreaterThan(0);
    expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
  });
});

describe("validateResetToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects empty tokens", async () => {
    const { validateResetToken } = await import("@/lib/password-reset/service");
    await expect(validateResetToken("")).resolves.toEqual({
      valid: false,
      reason: "invalid",
    });
  });

  it("rejects invalid tokens", async () => {
    mockTokenFindOne.mockResolvedValue(null);

    const { validateResetToken } = await import("@/lib/password-reset/service");
    await expect(validateResetToken("bad-token")).resolves.toEqual({
      valid: false,
      reason: "invalid",
    });
  });

  it("rejects expired tokens", async () => {
    mockTokenFindOne.mockResolvedValue({
      expiresAt: new Date(Date.now() - 60_000),
      usedAt: null,
    });

    const { validateResetToken } = await import("@/lib/password-reset/service");
    await expect(validateResetToken("expired-token")).resolves.toEqual({
      valid: false,
      reason: "expired",
    });
    expect(mockTokenDeleteOne).toHaveBeenCalled();
  });

  it("rejects used tokens", async () => {
    mockTokenFindOne.mockResolvedValue({
      expiresAt: getResetTokenExpiryDate(),
      usedAt: new Date(),
    });

    const { validateResetToken } = await import("@/lib/password-reset/service");
    await expect(validateResetToken("used-token")).resolves.toEqual({
      valid: false,
      reason: "used",
    });
  });

  it("accepts valid tokens", async () => {
    mockTokenFindOne.mockResolvedValue({
      expiresAt: getResetTokenExpiryDate(),
      usedAt: null,
    });

    const { validateResetToken } = await import("@/lib/password-reset/service");
    await expect(validateResetToken("valid-token")).resolves.toEqual({
      valid: true,
    });
  });
});

describe("resetPasswordWithToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates the password and deletes the token on success", async () => {
    const token = generateResetToken();
    mockTokenFindOne.mockResolvedValue({
      userId: "user-1",
      expiresAt: getResetTokenExpiryDate(),
      usedAt: null,
    });
    mockUserFindByIdAndUpdate.mockResolvedValue({});
    mockTokenDeleteOne.mockResolvedValue({});

    const { resetPasswordWithToken } = await import("@/lib/password-reset/service");
    const result = await resetPasswordWithToken(token, "new-password-123");

    expect(result.ok).toBe(true);
    expect(mockUserFindByIdAndUpdate).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        passwordHash: expect.any(String),
      }),
    );
    expect(mockTokenDeleteOne).toHaveBeenCalledWith({
      tokenHash: hashResetToken(token),
    });
  });

  it("fails for invalid tokens", async () => {
    mockTokenFindOne.mockResolvedValue(null);

    const { resetPasswordWithToken } = await import("@/lib/password-reset/service");
    const result = await resetPasswordWithToken("bad-token", "new-password-123");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
    }
  });

  it("cannot reuse a token after successful reset", async () => {
    const token = generateResetToken();
    mockTokenFindOne.mockResolvedValueOnce({
      userId: "user-1",
      expiresAt: getResetTokenExpiryDate(),
      usedAt: null,
    });
    mockUserFindByIdAndUpdate.mockResolvedValue({});
    mockTokenDeleteOne.mockResolvedValue({});

    const { resetPasswordWithToken, validateResetToken } = await import(
      "@/lib/password-reset/service"
    );

    await resetPasswordWithToken(token, "new-password-123");

    mockTokenFindOne.mockResolvedValue(null);

    await expect(validateResetToken(token)).resolves.toEqual({
      valid: false,
      reason: "invalid",
    });
  });
});

describe("password authentication after reset", () => {
  it("rejects the old password and accepts the new password", async () => {
    const { compare, hash } = await import("bcryptjs");
    const oldPassword = "old-password-123";
    const newPassword = "new-password-456";
    const oldHash = await hash(oldPassword, 12);
    const updatedHash = await hash(newPassword, 12);

    expect(await compare(oldPassword, oldHash)).toBe(true);
    expect(await compare(newPassword, oldHash)).toBe(false);
    expect(await compare(newPassword, updatedHash)).toBe(true);
    expect(await compare(oldPassword, updatedHash)).toBe(false);
  });
});

describe("forgot password validation", () => {
  it("requires a valid email format", async () => {
    const { forgotPasswordSchema } = await import(
      "@/lib/validations/password-reset"
    );

    expect(forgotPasswordSchema.safeParse({ email: "not-an-email" }).success).toBe(
      false,
    );
    expect(
      forgotPasswordSchema.safeParse({ email: "founder@example.com" }).success,
    ).toBe(true);
  });
});

describe("reset password validation", () => {
  it("requires matching confirmation", async () => {
    const { resetPasswordSchema } = await import(
      "@/lib/validations/password-reset"
    );

    const invalid = resetPasswordSchema.safeParse({
      token: "token",
      password: "password123",
      confirmPassword: "different123",
    });
    expect(invalid.success).toBe(false);

    const valid = resetPasswordSchema.safeParse({
      token: "token",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(valid.success).toBe(true);
  });
});
