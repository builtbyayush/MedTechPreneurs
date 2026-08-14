import { Bell } from "lucide-react";

import { cn } from "@/lib/utils";

type NotificationButtonProps = {
  unreadCount?: number;
  className?: string;
};

export function NotificationButton({
  unreadCount = 0,
  className,
}: NotificationButtonProps) {
  const hasUnread = unreadCount > 0;

  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex size-10 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal",
        className,
      )}
      aria-label={
        hasUnread
          ? `${unreadCount} unread messages`
          : "Message notifications"
      }
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
  );
}
