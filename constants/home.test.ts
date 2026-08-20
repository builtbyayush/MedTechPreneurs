import { describe, expect, it } from "vitest";

import {
  HOME_QUICK_ACTIONS,
  HOME_UPCOMING_EVENT_CATEGORIES,
} from "@/constants/home";
import { APP_SHELL_ROUTES, ROUTES } from "@/constants/routes";

describe("HOME_QUICK_ACTIONS", () => {
  it("defines four unique quick actions", () => {
    expect(HOME_QUICK_ACTIONS).toHaveLength(4);

    const ids = HOME_QUICK_ACTIONS.map((action) => action.id);
    expect(new Set(ids).size).toBe(4);
  });

  it("points every action at an existing app shell route", () => {
    for (const action of HOME_QUICK_ACTIONS) {
      expect(action.label.trim().length).toBeGreaterThan(0);
      expect(action.description.trim().length).toBeGreaterThan(0);
      expect(APP_SHELL_ROUTES).toContain(action.href);
    }
  });

  it("covers primary Splice workflows without toolkit or settings", () => {
    const hrefs = HOME_QUICK_ACTIONS.map((action) => action.href);
    const ids = HOME_QUICK_ACTIONS.map((action) => action.id);

    expect(hrefs).toContain(ROUTES.app.discover);
    expect(hrefs).toContain(ROUTES.app.matches);
    expect(hrefs).toContain(ROUTES.app.messages);
    expect(hrefs).toContain(ROUTES.app.profile);
    expect(hrefs).not.toContain(ROUTES.app.toolkit);
    expect(hrefs).not.toContain(ROUTES.app.settings);
    expect(ids).not.toContain("toolkit");
  });
});

describe("HOME_UPCOMING_EVENT_CATEGORIES", () => {
  it("defines exactly two event categories", () => {
    expect(HOME_UPCOMING_EVENT_CATEGORIES).toHaveLength(2);
    expect(HOME_UPCOMING_EVENT_CATEGORIES.map((category) => category.label)).toEqual([
      "Networking Events",
      "Fundraising Events",
    ]);
  });
});
