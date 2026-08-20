import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetEmailVerificationStatus = vi.fn();
const mockIssueEmailVerificationCode = vi.fn();
const mockConfirmEmailVerificationCode = vi.fn();

let mockAuthSession: { user: { id: string } } | null = {
  user: { id: "user-1" },
};

vi.mock("@/auth", () => ({
  auth: (handler: (request: Request & { auth: typeof mockAuthSession }) => unknown) => {
    return (request: Request) =>
      handler(Object.assign(request, { auth: mockAuthSession }));
  },
}));

vi.mock("@/lib/email/verification-code", () => ({
  getEmailVerificationStatus: (...args: unknown[]) =>
    mockGetEmailVerificationStatus(...args),
  issueEmailVerificationCode: (...args: unknown[]) =>
    mockIssueEmailVerificationCode(...args),
  confirmEmailVerificationCode: (...args: unknown[]) =>
    mockConfirmEmailVerificationCode(...args),
}));

describe("/api/auth/verify-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthSession = { user: { id: "user-1" } };
    mockGetEmailVerificationStatus.mockResolvedValue({
      emailVerified: false,
      email: "founder@example.com",
    });
    mockIssueEmailVerificationCode.mockResolvedValue({
      email: "founder@example.com",
      cooldownSeconds: 60,
      devCode: "123456",
    });
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuthSession = null;

    const { GET } = await import("@/app/api/auth/verify-email/route");
    const response = await GET(new Request("http://localhost/api/auth/verify-email"));

    expect(response.status).toBe(401);
    expect(mockGetEmailVerificationStatus).not.toHaveBeenCalled();
  });

  it("returns verification status for the authenticated user", async () => {
    const { GET } = await import("@/app/api/auth/verify-email/route");
    const response = await GET(new Request("http://localhost/api/auth/verify-email"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.email).toBe("founder@example.com");
    expect(mockGetEmailVerificationStatus).toHaveBeenCalledWith("user-1");
  });

  it("resends a code for the authenticated onboarding user", async () => {
    const { POST } = await import("@/app/api/auth/verify-email/route");
    const response = await POST(
      new Request("http://localhost/api/auth/verify-email", { method: "POST" }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(mockIssueEmailVerificationCode).toHaveBeenCalledWith("user-1");
  });
});

describe("/api/auth/verify-email/confirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthSession = { user: { id: "user-1" } };
    mockConfirmEmailVerificationCode.mockResolvedValue({ verified: true });
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuthSession = null;

    const { POST } = await import("@/app/api/auth/verify-email/confirm/route");
    const response = await POST(
      new Request("http://localhost/api/auth/verify-email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "123456" }),
      }),
    );

    expect(response.status).toBe(401);
    expect(mockConfirmEmailVerificationCode).not.toHaveBeenCalled();
  });

  it("verifies the authenticated user's code", async () => {
    const { POST } = await import("@/app/api/auth/verify-email/confirm/route");
    const response = await POST(
      new Request("http://localhost/api/auth/verify-email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "123456" }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.verified).toBe(true);
    expect(mockConfirmEmailVerificationCode).toHaveBeenCalledWith(
      "user-1",
      "123456",
    );
  });

  it("returns 400 for an incorrect OTP instead of 401", async () => {
    mockConfirmEmailVerificationCode.mockResolvedValue({
      verified: false,
      message: "Incorrect code. Try again.",
    });

    const { POST } = await import("@/app/api/auth/verify-email/confirm/route");
    const response = await POST(
      new Request("http://localhost/api/auth/verify-email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "000000" }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Incorrect code. Try again.");
  });

  it("returns 400 for an expired OTP", async () => {
    mockConfirmEmailVerificationCode.mockResolvedValue({
      verified: false,
      message: "That code has expired. Request a new one.",
    });

    const { POST } = await import("@/app/api/auth/verify-email/confirm/route");
    const response = await POST(
      new Request("http://localhost/api/auth/verify-email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "123456" }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("expired");
  });

  it("scopes verification to the authenticated user id", async () => {
    mockAuthSession = { user: { id: "user-2" } };

    const { POST } = await import("@/app/api/auth/verify-email/confirm/route");
    await POST(
      new Request("http://localhost/api/auth/verify-email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "123456" }),
      }),
    );

    expect(mockConfirmEmailVerificationCode).toHaveBeenCalledWith(
      "user-2",
      "123456",
    );
  });
});
