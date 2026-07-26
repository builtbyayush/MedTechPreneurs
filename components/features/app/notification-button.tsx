import { Bell } from "lucide-react";

import { cn } from "@/lib/utils";

type NotificationButtonProps = {
  className?: string;
};

export function NotificationButton({ className }: NotificationButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      aria-label="Notifications (coming soon)"
      disabled
    >
      <Bell className="size-[18px]" aria-hidden />
    </button>
  );
}
