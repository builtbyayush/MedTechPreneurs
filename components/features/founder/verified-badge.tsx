import { BadgeCheck } from "lucide-react";

import { cn } from "@/lib/utils";

type VerifiedBadgeProps = {
  className?: string;
};

export function VerifiedBadge({ className }: VerifiedBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-teal/20 bg-teal/[0.08] px-2.5 py-1 text-[10px] font-bold tracking-wide text-teal uppercase",
        className
      )}
    >
      <BadgeCheck className="size-3 shrink-0" aria-hidden />
      Verified
    </span>
  );
}
