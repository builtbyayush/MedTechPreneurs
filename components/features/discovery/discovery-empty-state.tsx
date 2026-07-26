import type { LucideIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DiscoveryEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function DiscoveryEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: DiscoveryEmptyStateProps) {
  return (
    <div
      className={cn(
        "founder-card-glass flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-white/10 px-6 py-10 text-center shadow-founder-card",
        className,
      )}
    >
      <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl border border-teal/20 bg-teal/10 text-teal">
        <Icon className="size-5" aria-hidden />
      </div>
      <h2 className="font-heading text-xl font-extrabold tracking-tight text-white">
        {title}
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/60">
        {description}
      </p>
      {actionLabel && onAction ? (
        <Button
          type="button"
          className={cn(
            buttonVariants({ variant: "default" }),
            "mt-6 h-11 bg-teal font-extrabold text-ink shadow-brutal-teal hover:bg-[#33d6d6]",
          )}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
