import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAuth = vi.fn();
const mockResetPassedFounders = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/lib/discovery/queries", () => ({
  resetPassedFounders: (...args: unknown[]) => mockResetPassedFounders(...args),
  resetRejectedDiscoveryProfiles: (...args: unknown[]) =>
    mockResetPassedFounders(...args),
}));

describe("POST /api/discovery/reset-passes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResetPassedFounders.mockResolvedValue(2);
  });

  it("returns 401 for unauthenticated requests", async () => {
    mockAuth.mockResolvedValue(null);

    const { POST } = await import("@/app/api/discovery/reset-passes/route");
    const response = await POST();

    expect(response.status).toBe(401);
    expect(mockResetPassedFounders).not.toHaveBeenCalled();
  });

  it("resets only the authenticated user's passed profiles", async () => {
    mockAuth.mockResolvedValue({ user: { id: "viewer-1" } });

    const { POST } = await import("@/app/api/discovery/reset-passes/route");
    const response = await POST();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true, resetCount: 2 });
    expect(mockResetPassedFounders).toHaveBeenCalledWith("viewer-1");
  });
});

describe("POST /api/swipe/reset-rejects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResetPassedFounders.mockResolvedValue(1);
  });

  it("delegates to the same reject reset logic", async () => {
    mockAuth.mockResolvedValue({ user: { id: "viewer-2" } });

    const { POST } = await import("@/app/api/swipe/reset-rejects/route");
    const response = await POST();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true, resetCount: 1 });
    expect(mockResetPassedFounders).toHaveBeenCalledWith("viewer-2");
  });
});
