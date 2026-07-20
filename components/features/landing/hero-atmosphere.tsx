import { cn } from "@/lib/utils";

type HeroAtmosphereProps = {
  className?: string;
};

/** Scene 1 background — noise only; card depth lives on FounderCardStage. */
export function HeroAtmosphere({ className }: HeroAtmosphereProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div className="absolute inset-0 landing-noise opacity-80" />
    </div>
  );
}
