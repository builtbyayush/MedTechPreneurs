import { describe, expect, it } from "vitest";

import { getSessionUserId } from "@/lib/auth/session-user";

describe("getSessionUserId", () => {
  it("returns the session user id when present", () => {
    expect(getSessionUserId({ user: { id: "user-1" }, expires: "" })).toBe(
      "user-1",
    );
  });

  it("returns null when the session is missing", () => {
    expect(getSessionUserId(null)).toBeNull();
  });

  it("returns null when the user id is empty", () => {
    expect(getSessionUserId({ user: { id: "" }, expires: "" })).toBeNull();
  });
});
