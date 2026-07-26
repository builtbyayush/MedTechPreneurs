import { cn } from "@/lib/utils";

type CompatibilityScoreProps = {
  score: number;
  className?: string;
  label?: string;
};

export function CompatibilityScore({
  score,
  className,
  label = "Compatibility",
}: CompatibilityScoreProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-teal/20 bg-teal/[0.06] px-4 py-3.5",
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
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="font-heading text-3xl font-black tabular-nums tracking-tight text-white">
          {score}
        </span>
        <span className="font-heading text-lg font-bold text-teal/80">%</span>
      </div>
      <div
        className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]"
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
