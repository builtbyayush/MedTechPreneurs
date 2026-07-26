import type { LucideIcon } from "lucide-react";
import {
  Compass,
  Home,
  MessageCircle,
  Sparkles,
  User,
} from "lucide-react";

import { ROUTES, type AppShellRoute } from "@/constants/routes";

export type AppNavItem = {
  href: AppShellRoute;
  label: string;
  icon: LucideIcon;
  /** When false, page shows a coming-soon placeholder */
  enabled: boolean;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    href: ROUTES.app.home,
    label: "Home",
    icon: Home,
    enabled: true,
  },
  {
    href: ROUTES.app.discover,
    label: "Discover",
    icon: Compass,
    enabled: true,
  },
  {
    href: ROUTES.app.matches,
    label: "Matches",
    icon: Sparkles,
    enabled: true,
  },
  {
    href: ROUTES.app.messages,
    label: "Messages",
    icon: MessageCircle,
    enabled: true,
  },
  {
    href: ROUTES.app.profile,
    label: "Profile",
    icon: User,
    enabled: true,
  },
];

export function getNavItem(pathname: string): AppNavItem | undefined {
  return APP_NAV_ITEMS.find(
    (item) =>
      pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}
