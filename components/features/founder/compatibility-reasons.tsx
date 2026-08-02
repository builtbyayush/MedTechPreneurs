import { cn } from "@/lib/utils";

type CompatibilityReasonsProps = {
  reasons: string[];
  className?: string;
  compact?: boolean;
};

export function CompatibilityReasons({
  reasons,
  className,
  compact = false,
}: CompatibilityReasonsProps) {
  if (reasons.length === 0) {
    return null;
  }

  return (
    <ul
      className={cn(
        compact
          ? "space-y-1 text-[13px] leading-snug text-white/65"
          : "space-y-1.5 text-sm leading-relaxed text-white/65",
        className,
      )}
      aria-label="Top compatibility reasons"
    >
      {reasons.map((reason) => (
        <li key={reason} className="flex gap-2">
          <span
            className={cn(
              "size-1 shrink-0 rounded-full bg-teal/80",
              compact ? "mt-1.5" : "mt-2",
            )}
            aria-hidden
          />
          <span>{reason}</span>
        </li>
      ))}
    </ul>
  );
}
