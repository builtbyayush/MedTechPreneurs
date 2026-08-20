import { BadgeCheck } from "lucide-react";

import { cn } from "@/lib/utils";

type VerifiedBadgeProps = {
  size?: "sm" | "md";
  className?: string;
  /** Email verification is the current MVP trust signal. */
  label?: string;
};

export function VerifiedBadge({
  size = "sm",
  className,
  label = "Email verified",
}: VerifiedBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-teal/20 bg-teal/[0.08] px-2.5 py-1 font-bold tracking-wide text-teal uppercase",
        size === "md" ? "text-xs" : "text-[10px]",
        className,
      )}
    >
      <BadgeCheck
        className={cn("shrink-0", size === "md" ? "size-3.5" : "size-3")}
        aria-hidden
      />
      {label}
    </span>
  );
}

export function EmailVerifiedBadge(props: Omit<VerifiedBadgeProps, "label">) {
  return <VerifiedBadge {...props} label="Email verified" />;
}
