import { ROUTES } from "@/constants/routes";
import type { HomeQuickAction, HomeUpcomingEventCategory } from "@/types/home";

export const HOME_QUICK_ACTIONS: HomeQuickAction[] = [
  {
    id: "discover",
    label: "Discover founders",
    description: "Browse your next co-founder match",
    href: ROUTES.app.discover,
  },
  {
    id: "matches",
    label: "View matches",
    description: "See who connected back",
    href: ROUTES.app.matches,
  },
  {
    id: "messages",
    label: "Open messages",
    description: "Continue matched conversations",
    href: ROUTES.app.messages,
  },
  {
    id: "profile",
    label: "Edit profile",
    description: "Improve compatibility accuracy",
    href: ROUTES.app.profile,
  },
];

/** Static event categories for the Home placeholder — no backend yet. */
export const HOME_UPCOMING_EVENT_CATEGORIES: HomeUpcomingEventCategory[] = [
  {
    id: "networking",
    label: "Networking Events",
  },
  {
    id: "fundraising",
    label: "Fundraising Events",
  },
];
