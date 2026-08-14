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
        "relative overflow-hidden rounded-lg border border-coral/25 bg-coral/[0.06]",
        compact ? "px-3 py-2.5" : "px-4 py-3.5",
        className,
      )}
      aria-label={`${score}% compatibility`}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-coral/80"
        aria-hidden
      />
      <p className="font-heading text-[10px] font-bold tracking-[0.18em] text-coral uppercase">
        {label}
      </p>
      <div className={cn("flex items-baseline gap-1.5", compact ? "mt-0.5" : "mt-1")}>
        <span
          className={cn(
            "font-heading font-black tabular-nums tracking-tight text-coral",
            compact ? "text-2xl" : "text-3xl",
          )}
        >
          {score}
        </span>
        <span
          className={cn(
            "font-heading font-bold text-coral/80",
            compact ? "text-base" : "text-lg",
          )}
        >
          %
        </span>
      </div>
      <div
        className={cn(
          "h-1 overflow-hidden rounded-full bg-muted",
          compact ? "mt-2" : "mt-3",
        )}
        aria-hidden
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-coral/90 to-coral/45"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
