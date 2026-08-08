import { cn } from "@/lib/utils";

export type FounderCategory = "healthcare" | "engineer" | "entrepreneur";

const LABELS: Record<FounderCategory, string> = {
  healthcare: "Healthcare Professional",
  engineer: "Engineer",
  entrepreneur: "Entrepreneur",
};

const ACCENT: Record<FounderCategory, string> = {
  healthcare: "bg-teal/10 text-teal border-teal/25",
  engineer: "bg-coral/10 text-coral border-coral/25",
  entrepreneur:
    "bg-deep-blue-soft/10 text-deep-blue-soft border-deep-blue-soft/25",
};

type CategoryBadgeProps = {
  category: FounderCategory;
  size?: "sm" | "md";
  className?: string;
};

export function CategoryBadge({
  category,
  size = "sm",
  className,
}: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-1 font-heading font-bold tracking-[0.12em] uppercase",
        size === "md" ? "text-xs" : "text-[10px]",
        ACCENT[category],
        className
      )}
    >
      {LABELS[category]}
    </span>
  );
}
