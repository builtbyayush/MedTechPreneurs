"use client";

import type { ReactNode } from "react";

import { BottomNavigation } from "@/components/features/app/bottom-navigation";
import { TopNavigation } from "@/components/features/app/top-navigation";

type AppShellUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type AppShellProps = {
  user: AppShellUser;
  profilePhotoUrl?: string | null;
  children: ReactNode;
};

export function AppShell({ user, profilePhotoUrl, children }: AppShellProps) {
  return (
    <div className="min-h-[100svh] bg-ink">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-lg flex-col border-x border-white/[0.06] lg:shadow-[0_0_80px_-20px_rgb(0_0_0/0.65)]">
        <TopNavigation user={user} profilePhotoUrl={profilePhotoUrl} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
        <BottomNavigation />
      </div>
    </div>
  );
}
