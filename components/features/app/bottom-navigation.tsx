"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useMessagingRealtime } from "@/components/providers/messaging-realtime-provider";
import { APP_NAV_ITEMS } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const pathname = usePathname();
  const { totalUnreadCount } = useMessagingRealtime();

  return (
    <nav
      aria-label="Main app navigation"
      className="sticky bottom-0 z-40 border-t border-border bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
    >
      <ul className="grid h-16 grid-cols-5">
        {APP_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const showUnreadBadge =
            item.href === ROUTES.app.messages && totalUnreadCount > 0;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "relative flex h-full flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-teal sm:text-[11px]",
                  isActive
                    ? "text-teal-text dark:text-teal"
                    : "text-muted-foreground hover:text-foreground/75",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={cn(
                    "relative inline-flex size-8 items-center justify-center rounded-xl transition-colors",
                    isActive ? "bg-teal/15" : "bg-transparent",
                  )}
                >
                  <Icon className="size-[18px]" aria-hidden />
                  {showUnreadBadge ? (
                    <span
                      className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-teal px-1 py-0.5 text-[9px] font-bold leading-none text-ink"
                      aria-label={`${totalUnreadCount} unread messages`}
                    >
                      {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                    </span>
                  ) : null}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
