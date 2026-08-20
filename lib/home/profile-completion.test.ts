import { describe, expect, it } from "vitest";

import { PROFILE_PHOTO_PLACEHOLDER } from "@/constants/profile";
import { calculateProfileCompletion } from "@/lib/home/profile-completion";

describe("calculateProfileCompletion", () => {
  it("returns zero percent for an empty profile", () => {
    const result = calculateProfileCompletion({});

    expect(result.percent).toBe(0);
    expect(result.completedCount).toBe(0);
    expect(result.totalCount).toBe(7);
    expect(result.missingItems).toHaveLength(7);
  });

  it("counts a complete profile at one hundred percent", () => {
    const result = calculateProfileCompletion({
      profilePhotoUrl: "https://res.cloudinary.com/demo/photo.jpg",
      headline: "Building in MedTech",
      bio: "Experienced founder.",
      skills: ["Regulatory", "Product"],
      companyName: "Splice Health",
      linkedinUrl: "https://linkedin.com/in/founder",
      websiteUrl: "https://example.com",
    });

    expect(result.percent).toBe(100);
    expect(result.completedCount).toBe(7);
    expect(result.missingItems).toEqual([]);
  });

  it("treats the default placeholder photo as incomplete", () => {
    const result = calculateProfileCompletion({
      profilePhotoUrl: PROFILE_PHOTO_PLACEHOLDER,
      headline: "Headline",
      bio: "Bio",
      skills: ["A", "B"],
      companyName: "Co",
      linkedinUrl: "https://linkedin.com/in/founder",
      websiteUrl: "https://example.com",
    });

    expect(result.missingItems).toContain("Profile photo");
    expect(result.percent).toBeLessThan(100);
  });

  it("requires at least two skills", () => {
    const result = calculateProfileCompletion({
      skills: ["Regulatory"],
    });

    expect(result.missingItems).toContain("Skills");
  });
});
