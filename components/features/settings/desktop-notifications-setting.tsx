"use client";

import { Monitor } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useBrowserNotifications } from "@/hooks/use-browser-notifications";
import { useToast } from "@/hooks/use-toast";
import {
  ensureBrowserNotificationSupport,
  getBrowserNotificationStatusLabel,
  getBrowserNotificationUnsupportedReason,
  showTestBrowserNotificationFromClick,
} from "@/lib/notifications/browser-notifications";

export function DesktopNotificationsSetting() {
  const { toast } = useToast();
  const {
    supported,
    permission,
    requestPermission,
    isGranted,
    isDenied,
    canRequest,
  } = useBrowserNotifications();

  async function handleEnable() {
    await ensureBrowserNotificationSupport();
    const result = await requestPermission();

    if (result === "granted") {
      toast({
        title: "Desktop notifications enabled",
        description: "Chrome will alert you when new messages arrive.",
        variant: "success",
      });
      const testResult = showTestBrowserNotificationFromClick();
      if (!testResult.ok) {
        toast({
          title: "Native notification failed",
          description: testResult.detail ?? "Could not show a test notification.",
        });
      }
      return;
    }

    if (result === "denied") {
      toast({
        title: "Notifications blocked",
        description:
          "Enable notifications for this site in Chrome settings if you change your mind.",
      });
    }
  }

  function handleTest() {
    const result = showTestBrowserNotificationFromClick();

    if (result.ok) {
      toast({
        title: "Native notification triggered",
        description:
          result.detail ??
          "Look outside Chrome for the system banner (not the in-app bell panel).",
        variant: "success",
      });
      return;
    }

    toast({
      title: "Native notification failed",
      description:
        result.detail ??
        "Check Chrome site settings and macOS Notifications for Google Chrome.",
    });
  }

  if (!supported) {
    return (
      <div className="rounded-xl border border-border bg-muted p-3 text-sm text-muted-foreground">
        {getBrowserNotificationUnsupportedReason() ??
          "Desktop notifications are not supported in this browser."}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-muted p-3">
      <div className="flex items-start gap-3">
        <Monitor className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Desktop notifications</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {getBrowserNotificationStatusLabel(permission)}
          </p>
          {canRequest ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-3 border-border bg-muted text-foreground hover:bg-muted"
              onClick={() => void handleEnable()}
            >
              Enable desktop notifications
            </Button>
          ) : null}
          {isGranted ? (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-teal/85">
                Chrome alerts appear when you are not focused on that
                conversation — including another Chrome profile window.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-border bg-muted text-foreground hover:bg-muted"
                onClick={() => void handleTest()}
              >
                Send test notification
              </Button>
            </div>
          ) : null}
          {isDenied ? (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Notifications are blocked. Messaging, unread badges, and in-app
              alerts still work normally.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
