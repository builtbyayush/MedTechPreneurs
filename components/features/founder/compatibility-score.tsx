import { cn } from "@/lib/utils";

type CompatibilityScoreProps = {
  score: number;
  className?: string;
  label?: string;
  compact?: boolean;
};

export function CompatibilityScore({
  score,
  className,
  label = "Compatibility",
  compact = false,
}: CompatibilityScoreProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-teal/20 bg-teal/[0.06]",
        compact ? "px-3 py-2.5" : "px-4 py-3.5",
        className,
      )}
      aria-label={`${score}% compatibility`}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-teal/80"
        aria-hidden
      />
      <p className="font-heading text-[10px] font-bold tracking-[0.18em] text-teal uppercase">
        {label}
      </p>
      <div className={cn("flex items-baseline gap-1.5", compact ? "mt-0.5" : "mt-1")}>
        <span
          className={cn(
            "font-heading font-black tabular-nums tracking-tight text-white",
            compact ? "text-2xl" : "text-3xl",
          )}
        >
          {score}
        </span>
        <span
          className={cn(
            "font-heading font-bold text-teal/80",
            compact ? "text-base" : "text-lg",
          )}
        >
          %
        </span>
      </div>
      <div
        className={cn(
          "h-1 overflow-hidden rounded-full bg-white/[0.06]",
          compact ? "mt-2" : "mt-3",
        )}
        aria-hidden
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal/90 to-teal/45"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
