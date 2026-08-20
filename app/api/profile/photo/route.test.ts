import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAuth = vi.fn();
const mockUpdateProfilePhotoUrl = vi.fn();
const mockIsAllowedProfilePhotoUrl = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/lib/profile/queries", () => ({
  updateProfilePhotoUrl: (...args: unknown[]) =>
    mockUpdateProfilePhotoUrl(...args),
}));

vi.mock("@/lib/cloudinary/server", () => ({
  isAllowedProfilePhotoUrl: (...args: unknown[]) =>
    mockIsAllowedProfilePhotoUrl(...args),
}));

describe("PATCH /api/profile/photo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAllowedProfilePhotoUrl.mockReturnValue(true);
  });

  it("rejects unauthenticated profile photo updates", async () => {
    mockAuth.mockResolvedValue(null);

    const { PATCH } = await import("@/app/api/profile/photo/route");
    const response = await PATCH(
      new Request("http://localhost/api/profile/photo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/splice/profile-images/user-1",
        }),
      }),
    );

    expect(response.status).toBe(401);
    expect(mockUpdateProfilePhotoUrl).not.toHaveBeenCalled();
  });

  it("updates only the authenticated user's profile photo", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockUpdateProfilePhotoUrl.mockResolvedValue({
      profilePhotoUrl:
        "https://res.cloudinary.com/demo/image/upload/v1/splice/profile-images/user-1",
    });

    const secureUrl =
      "https://res.cloudinary.com/demo/image/upload/v1/splice/profile-images/user-1";

    const { PATCH } = await import("@/app/api/profile/photo/route");
    const response = await PATCH(
      new Request("http://localhost/api/profile/photo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secureUrl }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockUpdateProfilePhotoUrl).toHaveBeenCalledWith("user-1", secureUrl);
  });

  it("rejects disallowed storage URLs", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockIsAllowedProfilePhotoUrl.mockReturnValue(false);

    const { PATCH } = await import("@/app/api/profile/photo/route");
    const response = await PATCH(
      new Request("http://localhost/api/profile/photo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secureUrl: "https://evil.example.com/photo.jpg",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mockUpdateProfilePhotoUrl).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/profile/photo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated photo removal", async () => {
    mockAuth.mockResolvedValue(null);

    const { DELETE } = await import("@/app/api/profile/photo/route");
    const response = await DELETE();

    expect(response.status).toBe(401);
    expect(mockUpdateProfilePhotoUrl).not.toHaveBeenCalled();
  });
});
