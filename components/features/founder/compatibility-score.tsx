import { cn } from "@/lib/utils";

type CompatibilityScoreProps = {
  score: number;
  className?: string;
};

export function CompatibilityScore({ score, className }: CompatibilityScoreProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-coral/20 bg-coral/[0.06] px-4 py-3.5",
        className
      )}
      aria-label={`${score}% complementarity`}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-coral/80"
        aria-hidden
      />
      <p className="font-heading text-[10px] font-bold tracking-[0.18em] text-teal uppercase">
        Complementarity
      </p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="font-heading text-3xl font-black tabular-nums tracking-tight text-coral">
          {score}
        </span>
        <span className="font-heading text-lg font-bold text-coral/80">%</span>
      </div>
      <div
        className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]"
        aria-hidden
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-coral/90 to-coral/50"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
