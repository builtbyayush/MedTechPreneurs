"use client";

import Link from "next/link";

import { Avatar } from "@/components/features/app/avatar";
import { NotificationButton } from "@/components/features/app/notification-button";
import { SplicePlusLogo } from "@/components/features/brand/splice-plus-logo";
import { ROUTES } from "@/constants/routes";

type TopNavigationProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export function TopNavigation({ user }: TopNavigationProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-elevated/80 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 sm:px-5">
        <Link
          href={ROUTES.app.home}
          className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          aria-label="Splice+ home"
        >
          <SplicePlusLogo className="text-lg sm:text-xl" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationButton />
          <Link
            href={ROUTES.app.profile}
            className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            aria-label="Open profile"
          >
            <Avatar
              name={user.name}
              imageUrl={user.image}
              size="sm"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
