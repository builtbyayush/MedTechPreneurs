import { describe, expect, it } from "vitest";

import { TOOLKIT_ENABLED } from "@/constants/features";
import { APP_NAV_ITEMS } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";

describe("navigation toolkit exposure", () => {
  it("keeps toolkit disabled via feature flag", () => {
    expect(TOOLKIT_ENABLED).toBe(false);
  });

  it("does not list toolkit in bottom navigation", () => {
    for (const item of APP_NAV_ITEMS) {
      expect(item.href).not.toBe(ROUTES.app.toolkit);
      expect(item.label.toLowerCase()).not.toContain("toolkit");
    }
  });
});
