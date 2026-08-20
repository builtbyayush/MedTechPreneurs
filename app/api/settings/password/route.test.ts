import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAuth = vi.fn();
const mockAssertActiveAccount = vi.fn();
const mockChangePasswordForUser = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/lib/auth/account", () => ({
  assertActiveAccount: (...args: unknown[]) => mockAssertActiveAccount(...args),
  AccountAccessError: class AccountAccessError extends Error {
    status = 403;
  },
}));

vi.mock("@/lib/settings/change-password", () => ({
  changePasswordForUser: (...args: unknown[]) => mockChangePasswordForUser(...args),
  ChangePasswordError: class ChangePasswordError extends Error {
    status: number;
    constructor(message: string, status = 400) {
      super(message);
      this.status = status;
    }
  },
}));

describe("PATCH /api/settings/password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAssertActiveAccount.mockResolvedValue(undefined);
    mockChangePasswordForUser.mockResolvedValue(undefined);
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const { PATCH } = await import("@/app/api/settings/password/route");
    const response = await PATCH(
      new Request("http://localhost/api/settings/password", {
        method: "PATCH",
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(401);
    expect(mockChangePasswordForUser).not.toHaveBeenCalled();
  });

  it("changes password for the authenticated session user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });

    const body = {
      currentPassword: "oldpassword1",
      newPassword: "newpassword1",
      confirmPassword: "newpassword1",
    };

    const { PATCH } = await import("@/app/api/settings/password/route");
    const response = await PATCH(
      new Request("http://localhost/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.message).toContain("Password changed successfully");
    expect(mockChangePasswordForUser).toHaveBeenCalledWith("user-1", {
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    });
  });

  it("returns validation errors for missing fields", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });

    const { PATCH } = await import("@/app/api/settings/password/route");
    const response = await PATCH(
      new Request("http://localhost/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mockChangePasswordForUser).not.toHaveBeenCalled();
  });
});
