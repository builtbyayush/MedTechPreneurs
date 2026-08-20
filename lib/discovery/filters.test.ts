import { describe, expect, it } from "vitest";

import {
  buildDiscoveryFilterExtensions,
  buildDiscoverySearchClause,
  hasActiveDiscoveryFilters,
  parseDiscoveryFiltersFromSearchParams,
  resolveViewerDiscoveryContext,
  sanitizeProfessionFilters,
} from "@/lib/discovery/filters";
import { parseDiscoveryFiltersQuery } from "@/lib/validations/discovery";
import type { FounderRole } from "@/types/onboarding";

describe("resolveViewerDiscoveryContext", () => {
  it("limits profession options to the viewer's looking-for categories", () => {
    const context = resolveViewerDiscoveryContext({
      lookingForRoles: ["engineer", "business"],
    });

    expect(context.allowedRoles).toContain("engineer");
    expect(context.allowedRoles).toContain("designer");
    expect(context.allowedRoles).toContain("business");
    expect(context.allowedRoles).not.toContain("doctor");
    expect(context.professionOptions.map((option) => option.value)).not.toContain(
      "doctor",
    );
  });

  it("prefers legacy lookingFor categories when present", () => {
    const context = resolveViewerDiscoveryContext({
      lookingFor: ["healthcare"],
      lookingForRoles: ["engineer"],
    });

    expect(context.allowedRoles).toEqual(["doctor", "researcher"]);
  });
});

describe("sanitizeProfessionFilters", () => {
  it("drops professions outside the viewer's allowed roles", () => {
    const allowed: FounderRole[] = ["engineer", "designer"];
    expect(
      sanitizeProfessionFilters(["engineer", "doctor"], allowed),
    ).toEqual(["engineer"]);
  });

  it("deduplicates requested professions", () => {
    const allowed: FounderRole[] = ["engineer", "designer"];
    expect(
      sanitizeProfessionFilters(["engineer", "engineer"], allowed),
    ).toEqual(["engineer"]);
  });
});

describe("buildDiscoveryFilterExtensions", () => {
  it("combines search and profession filters", () => {
    const context = resolveViewerDiscoveryContext({
      lookingForRoles: ["engineer", "doctor"],
    });

    const extensions = buildDiscoveryFilterExtensions(context, {
      query: "AI",
      professions: ["engineer"],
    });

    expect(extensions).toHaveLength(2);
    expect(extensions[0]).toEqual({ founderRole: { $in: ["engineer"] } });
    expect(extensions[1]).toHaveProperty("$or");
  });

  it("uses all allowed roles when no profession chips are selected", () => {
    const context = resolveViewerDiscoveryContext({
      lookingForRoles: ["engineer"],
    });

    const extensions = buildDiscoveryFilterExtensions(context, {
      query: "medtech",
    });

    expect(extensions[0]).toEqual({
      founderRole: { $in: ["engineer", "designer"] },
    });
  });
});

describe("buildDiscoverySearchClause", () => {
  it("searches public profile fields without exposing private data fields", () => {
    const clause = buildDiscoverySearchClause("cardio") as {
      $or: Array<Record<string, unknown>>;
    };

    const fields = clause.$or.flatMap((entry) => Object.keys(entry));
    expect(fields).toEqual(
      expect.arrayContaining([
        "name",
        "companyName",
        "headline",
        "profession",
        "specialisation",
        "skills",
      ]),
    );
    expect(fields).not.toContain("email");
    expect(fields).not.toContain("mobile");
  });
});

describe("discovery filter query parsing", () => {
  it("accepts repeated profession params", () => {
    const params = new URLSearchParams();
    params.append("profession", "engineer");
    params.append("profession", "designer");
    params.set("q", "AI");

    const parsed = parseDiscoveryFiltersQuery(params);
    expect(parsed.profession).toEqual(["engineer", "designer"]);
    expect(parsed.q).toBe("AI");
  });

  it("rejects overly short search strings", () => {
    const params = new URLSearchParams();
    params.set("q", "a");

    expect(() => parseDiscoveryFiltersQuery(params)).toThrow();
  });

  it("ignores invalid profession values", () => {
    const parsed = parseDiscoveryFiltersFromSearchParams(
      new URLSearchParams("profession=engineer&profession=not-a-role"),
    );

    expect(parsed.professions).toEqual(["engineer"]);
  });
});

describe("hasActiveDiscoveryFilters", () => {
  it("detects active search and profession filters", () => {
    expect(hasActiveDiscoveryFilters({ query: "a" })).toBe(false);
    expect(hasActiveDiscoveryFilters({ query: "ai" })).toBe(true);
    expect(
      hasActiveDiscoveryFilters({ professions: ["engineer"] }),
    ).toBe(true);
  });
});
