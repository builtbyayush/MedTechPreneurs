import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/60 px-6 py-10 text-center backdrop-blur-sm dark:bg-muted",
        className,
      )}
    >
      {Icon ? (
        <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl border border-teal/20 bg-teal/10 text-teal-text dark:text-teal">
          <Icon className="size-5" aria-hidden />
        </div>
      ) : null}
      <h3 className="font-heading text-lg font-bold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
