import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/features/app/empty-state";
import { cn } from "@/lib/utils";

type ComingSoonCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
};

export function ComingSoonCard({
  title,
  description,
  icon,
  className,
}: ComingSoonCardProps) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      className={cn("founder-card-glass shadow-founder-card min-h-[320px]", className)}
      action={
        <span className="inline-flex rounded-full border border-teal/25 bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal">
          Coming soon
        </span>
      }
    />
  );
}
