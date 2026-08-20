import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCompare = vi.fn();
const mockHash = vi.fn();
const mockUserFindById = vi.fn();
const mockUserFindByIdAndUpdate = vi.fn();
const mockCodeFindOne = vi.fn();
const mockCodeFindOneAndUpdate = vi.fn();
const mockCodeDeleteOne = vi.fn();

const mockRecord = {
  codeHash: "hashed-code",
  expiresAt: new Date(Date.now() + 60_000),
  attempts: 0,
  save: vi.fn().mockResolvedValue(undefined),
};

vi.mock("bcryptjs", () => ({
  compare: (...args: unknown[]) => mockCompare(...args),
  hash: (...args: unknown[]) => mockHash(...args),
}));

vi.mock("@/lib/db", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/models/User", () => ({
  User: {
    findById: (...args: unknown[]) => mockUserFindById(...args),
    findByIdAndUpdate: (...args: unknown[]) => mockUserFindByIdAndUpdate(...args),
  },
}));

vi.mock("@/models/EmailVerificationCode", () => ({
  EmailVerificationCode: {
    findOne: (...args: unknown[]) => mockCodeFindOne(...args),
    findOneAndUpdate: (...args: unknown[]) => mockCodeFindOneAndUpdate(...args),
    deleteOne: (...args: unknown[]) => mockCodeDeleteOne(...args),
  },
}));

vi.mock("@/lib/email/send-verification-code", () => ({
  sendVerificationCode: vi.fn().mockResolvedValue({ devCode: "123456" }),
}));

describe("confirmEmailVerificationCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserFindById.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ emailVerified: false }),
      }),
    });
    mockCodeFindOne.mockReturnValue({
      select: vi.fn().mockResolvedValue(mockRecord),
    });
    mockCompare.mockResolvedValue(true);
    mockUserFindByIdAndUpdate.mockResolvedValue({});
    mockCodeDeleteOne.mockResolvedValue({});
    mockRecord.expiresAt = new Date(Date.now() + 60_000);
    mockRecord.attempts = 0;
  });

  it("verifies a correct code", async () => {
    const { confirmEmailVerificationCode } = await import(
      "@/lib/email/verification-code"
    );

    const result = await confirmEmailVerificationCode("user-1", "123456");

    expect(result.verified).toBe(true);
    expect(mockUserFindByIdAndUpdate).toHaveBeenCalledWith("user-1", {
      emailVerified: true,
    });
  });

  it("returns an OTP-specific error for an incorrect code", async () => {
    mockCompare.mockResolvedValue(false);

    const { confirmEmailVerificationCode } = await import(
      "@/lib/email/verification-code"
    );

    const result = await confirmEmailVerificationCode("user-1", "000000");

    expect(result).toEqual({
      verified: false,
      message: "Incorrect code. Try again.",
    });
  });

  it("returns an expiry message for expired codes", async () => {
    mockRecord.expiresAt = new Date(Date.now() - 60_000);

    const { confirmEmailVerificationCode } = await import(
      "@/lib/email/verification-code"
    );

    const result = await confirmEmailVerificationCode("user-1", "123456");

    expect(result).toEqual({
      verified: false,
      message: "That code has expired. Request a new one.",
    });
    expect(mockCodeDeleteOne).toHaveBeenCalledWith({ userId: "user-1" });
  });

  it("does not verify another user's email when no code exists for that user", async () => {
    mockCodeFindOne.mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });

    const { confirmEmailVerificationCode } = await import(
      "@/lib/email/verification-code"
    );

    const result = await confirmEmailVerificationCode("user-2", "123456");

    expect(result.verified).toBe(false);
    expect(mockUserFindByIdAndUpdate).not.toHaveBeenCalled();
  });
});

describe("issueEmailVerificationCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserFindById.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          email: "founder@example.com",
          emailVerified: false,
        }),
      }),
    });
    mockCodeFindOne.mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });
    mockHash.mockResolvedValue("hashed-code");
    mockCodeFindOneAndUpdate.mockResolvedValue({});
  });

  it("issues a code for the requested user", async () => {
    const { issueEmailVerificationCode } = await import(
      "@/lib/email/verification-code"
    );

    const result = await issueEmailVerificationCode("user-1");

    expect(result.email).toBe("founder@example.com");
    expect(mockCodeFindOneAndUpdate).toHaveBeenCalled();
  });
});
