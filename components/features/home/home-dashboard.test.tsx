/** @vitest-environment jsdom */

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { HomeDashboard } from "@/components/features/home/home-dashboard";
import { UpcomingEventsSection } from "@/components/features/home/upcoming-events-section";
import { HOME_QUICK_ACTIONS } from "@/constants/home";
import { APP_NAV_ITEMS } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import type { HomeDashboardData } from "@/types/home";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

function createHomeDashboardData(
  overrides: Partial<HomeDashboardData> = {},
): HomeDashboardData {
  return {
    welcome: {
      firstName: "Asha",
      founderRoleLabel: "Doctor",
      buildingFocusLabel: "MedTech",
      currentStageLabel: "Idea",
      companyName: "Pulse Labs",
    },
    profileCompletion: {
      percent: 57,
      completedCount: 4,
      totalCount: 7,
      missingItems: ["Bio", "LinkedIn", "Website"],
      items: [],
    },
    compatibilityInsight: {
      headline: "Strong overlap with engineers",
      detail: "Your next best match is an engineer building in diagnostics.",
      topScore: 82,
    },
    recentMatches: [],
    unreadMessages: [],
    suggestedFounders: [],
    recentActivity: [],
    quickActions: HOME_QUICK_ACTIONS,
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
});

describe("HomeDashboard", () => {
  it("renders the welcome section and quick actions heading", () => {
    render(<HomeDashboard data={createHomeDashboardData()} />);

    expect(screen.getByRole("heading", { level: 1, name: "Asha" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Quick actions" })).toHaveAttribute(
      "id",
      "quick-actions-heading",
    );
  });

  it("renders all quick actions as navigable links", () => {
    render(<HomeDashboard data={createHomeDashboardData()} />);

    const quickActionsSection = screen.getByRole("region", {
      name: "Quick actions",
    });

    for (const action of HOME_QUICK_ACTIONS) {
      const link = within(quickActionsSection).getByRole("link", {
        name: action.label,
      });

      expect(link).toHaveAttribute("href", action.href);
    }
  });

  it("does not render a toolkit quick action", () => {
    render(<HomeDashboard data={createHomeDashboardData()} />);

    expect(screen.queryByRole("link", { name: /toolkit/i })).not.toBeInTheDocument();
    expect(HOME_QUICK_ACTIONS).toHaveLength(4);
  });

  it("renders the upcoming events section with coming soon placeholders", () => {
    render(<HomeDashboard data={createHomeDashboardData()} />);

    expect(screen.getByRole("heading", { name: "Upcoming events" })).toHaveAttribute(
      "id",
      "upcoming-events-heading",
    );
    expect(screen.getByRole("heading", { name: "Networking Events" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fundraising Events" })).toBeInTheDocument();
    expect(screen.getAllByText("Coming soon")).toHaveLength(2);
  });

  it("does not expose discovery search or reset controls on Home", () => {
    render(<HomeDashboard data={createHomeDashboardData()} />);

    expect(screen.queryByRole("button", { name: /search/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /reset passed/i })).not.toBeInTheDocument();
  });

  it("shows section empty states without hiding quick actions", () => {
    render(<HomeDashboard data={createHomeDashboardData()} />);

    expect(screen.getByText("No matches yet")).toBeInTheDocument();
    expect(screen.getByText("All caught up")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Discover founders" }).length).toBeGreaterThan(
      0,
    );
  });

  it("links profile completion CTA to profile when incomplete", () => {
    render(<HomeDashboard data={createHomeDashboardData()} />);

    expect(screen.getByRole("link", { name: "Complete profile" })).toHaveAttribute(
      "href",
      ROUTES.app.profile,
    );
  });

  it("hides profile completion CTA when profile is complete", () => {
    render(
      <HomeDashboard
        data={createHomeDashboardData({
          profileCompletion: {
            percent: 100,
            completedCount: 7,
            totalCount: 7,
            missingItems: [],
            items: [],
          },
        })}
      />,
    );

    expect(screen.queryByRole("link", { name: "Complete profile" })).not.toBeInTheDocument();
    expect(screen.getByText(/fully complete/i)).toBeInTheDocument();
  });
});

describe("HomeDashboard quick action destinations", () => {
  it("maps each configured action to a known app route", () => {
    const expectedRoutes = [
      ROUTES.app.discover,
      ROUTES.app.matches,
      ROUTES.app.messages,
      ROUTES.app.profile,
    ];

    expect(HOME_QUICK_ACTIONS.map((action) => action.href)).toEqual(expectedRoutes);
  });
});

describe("UpcomingEventsSection", () => {
  it("does not render event cards as links or buttons", () => {
    render(<UpcomingEventsSection />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("APP_NAV_ITEMS", () => {
  it("does not expose toolkit in app navigation", () => {
    const labels = APP_NAV_ITEMS.map((item) => item.label.toLowerCase());
    const hrefs = APP_NAV_ITEMS.map((item) => item.href);

    expect(labels.some((label) => label.includes("toolkit"))).toBe(false);
    expect(hrefs).not.toContain(ROUTES.app.toolkit);
  });
});
