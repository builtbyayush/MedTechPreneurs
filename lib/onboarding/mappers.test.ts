import { describe, expect, it } from "vitest";

import {
  buildLegacyLookingForCategories,
  mapFounderRoleToCategory,
  mapLookingForRolesToCategories,
} from "@/lib/onboarding/mappers";

describe("buildLegacyLookingForCategories", () => {
  it("excludes the viewer's own legacy category from lookingFor", () => {
    const result = buildLegacyLookingForCategories(
      ["doctor", "engineer"],
      "doctor",
    );

    expect(mapFounderRoleToCategory("doctor")).toBe("healthcare");
    expect(result).not.toContain("healthcare");
    expect(result).toContain("engineer");
  });

  it("falls back to all mapped categories when exclusion would leave none", () => {
    const result = buildLegacyLookingForCategories(["doctor"], "doctor");

    expect(result).toEqual(mapLookingForRolesToCategories(["doctor"]));
  });

  it("deduplicates mapped categories", () => {
    const result = buildLegacyLookingForCategories(
      ["engineer", "designer"],
      "business",
    );

    expect(result).toEqual(["engineer"]);
  });
});
