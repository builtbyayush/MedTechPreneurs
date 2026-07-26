"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_NAV_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main app navigation"
      className="sticky bottom-0 z-40 border-t border-white/10 bg-ink-elevated/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
    >
      <ul className="grid h-16 grid-cols-5">
        {APP_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-teal sm:text-[11px]",
                  isActive
                    ? "text-teal"
                    : "text-white/45 hover:text-white/75",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded-xl transition-colors",
                    isActive ? "bg-teal/15" : "bg-transparent",
                  )}
                >
                  <Icon className="size-[18px]" aria-hidden />
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
