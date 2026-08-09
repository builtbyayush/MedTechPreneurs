"use client";

import { Bell, Check, MessageCircle, Monitor } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useBrowserNotifications } from "@/hooks/use-browser-notifications";
import { useToast } from "@/hooks/use-toast";
import {
  ensureBrowserNotificationSupport,
  getBrowserNotificationStatusLabel,
  getBrowserNotificationUnsupportedReason,
  showTestBrowserNotificationFromClick,
} from "@/lib/notifications/browser-notifications";
import { cn } from "@/lib/utils";

type NotificationMenuProps = {
  unreadCount?: number;
  className?: string;
};

export function NotificationMenu({
  unreadCount = 0,
  className,
}: NotificationMenuProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const {
    supported,
    permission,
    requestPermission,
    isGranted,
    isDenied,
    canRequest,
  } = useBrowserNotifications();

  const hasUnread = unreadCount > 0;

  async function handleEnableNotifications() {
    await ensureBrowserNotificationSupport();
    const result = await requestPermission();

    if (result === "granted") {
      toast({
        title: "Desktop notifications enabled",
        description: "Chrome will alert you when new messages arrive.",
        variant: "success",
      });
      handleTestNotification();
      setOpen(false);
      return;
    }

    if (result === "denied") {
      toast({
        title: "Notifications blocked",
        description:
          "Enable notifications for this site in your browser settings if you change your mind.",
        variant: "default",
      });
      setOpen(false);
      return;
    }

    toast({
      title: "Notifications not enabled",
      description: "Permission was not granted.",
      variant: "default",
    });
  }

  function handleTestNotification() {
    const result = showTestBrowserNotificationFromClick();

    if (result.ok) {
      toast({
        title: "Native notification triggered",
        description:
          result.detail ??
          "Look outside Chrome for the system banner (not the in-app bell panel).",
        variant: "success",
      });
      setOpen(false);
      return;
    }

    toast({
      title: "Native notification failed",
      description:
        result.detail ??
        "Check Chrome site settings and macOS Notifications for Google Chrome.",
    });
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "relative inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal",
        )}
        aria-label={
          hasUnread
            ? `${unreadCount} unread messages — open notifications menu`
            : "Open notifications menu"
        }
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Bell className="size-[18px]" aria-hidden />
        {hasUnread ? (
          <span
            className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-teal px-1 py-0.5 text-[9px] font-bold leading-none text-ink"
            aria-hidden
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            aria-label="Close notifications menu"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-72 rounded-2xl border border-white/10 bg-ink-elevated/95 p-3 shadow-match-surface backdrop-blur-md"
          >
            <p className="px-1 text-xs font-semibold uppercase tracking-wide text-white/45">
              Notifications
            </p>

            <div className="mt-2 space-y-2">
              <Link
                href={ROUTES.app.messages}
                role="menuitem"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white transition-colors hover:bg-white/[0.06]"
                onClick={() => setOpen(false)}
              >
                <MessageCircle className="size-4 shrink-0 text-teal" aria-hidden />
                <span>View messages</span>
                {hasUnread ? (
                  <span className="ml-auto rounded-full bg-teal px-2 py-0.5 text-[10px] font-bold text-ink">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </Link>

              {supported ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                  <div className="flex items-start gap-3">
                    {isGranted ? (
                      <Check className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
                    ) : (
                      <Monitor className="mt-0.5 size-4 shrink-0 text-white/60" aria-hidden />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">
                        Desktop notifications
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-white/55">
                        {getBrowserNotificationStatusLabel(permission)}
                      </p>
                      {canRequest ? (
                        <Button
                          type="button"
                          size="sm"
                          className="mt-3 w-full"
                          onClick={() => void handleEnableNotifications()}
                        >
                          Enable desktop notifications
                        </Button>
                      ) : null}
                      {isGranted ? (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs leading-relaxed text-teal/85">
                            Alerts appear when you are not focused on that chat.
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="w-full border-white/15 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                            onClick={handleTestNotification}
                          >
                            Send test notification
                          </Button>
                        </div>
                      ) : null}
                      {isDenied ? (
                        <p className="mt-2 text-xs leading-relaxed text-white/45">
                          Unblock notifications in Chrome site settings to
                          receive alerts.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs leading-relaxed text-white/55">
                  {getBrowserNotificationUnsupportedReason() ??
                    "Desktop notifications are not supported in this browser."}
                </p>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
