"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { BottomNavigation } from "@/components/features/app/bottom-navigation";
import { TopNavigation } from "@/components/features/app/top-navigation";
import { MessagingRealtimeProvider } from "@/components/providers/messaging-realtime-provider";
import { NotificationSetup } from "@/components/providers/notification-setup";
import { cn } from "@/lib/utils";

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
  const pathname = usePathname();
  /** Chat thread uses its own internal scroll — prevent outer main from scrolling too. */
  const isConversationThread = /^\/messages\/[^/]+$/.test(pathname);

  return (
    <MessagingRealtimeProvider>
      <NotificationSetup />
      <div className="min-h-[100svh] bg-background">
        <div className="mx-auto flex h-[100svh] w-full max-w-lg flex-col overflow-hidden border-x border-border lg:shadow-[0_0_80px_-20px_rgb(15_42_71/0.12)] dark:lg:shadow-[0_0_80px_-20px_rgb(0_0_0/0.65)]">
          <TopNavigation user={user} profilePhotoUrl={profilePhotoUrl} />
          <main
            className={cn(
              "min-h-0 flex-1 overflow-x-hidden",
              isConversationThread
                ? "flex flex-col overflow-hidden"
                : "overflow-y-auto",
            )}
          >
            {children}
          </main>
          {!isConversationThread ? <BottomNavigation /> : null}
        </div>
      </div>
    </MessagingRealtimeProvider>
  );
}
