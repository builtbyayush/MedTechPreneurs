import { cn } from "@/lib/utils";

type FounderCardStageProps = {
  children: React.ReactNode;
  className?: string;
};

/** Subtle depth platform for hero Founder Card — no distracting gradients. */
export function FounderCardStage({ children, className }: FounderCardStageProps) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[380px]", className)}>
      {/* Ground shadow */}
      <div
        className="pointer-events-none absolute -bottom-3 left-1/2 h-6 w-[78%] -translate-x-1/2 rounded-[100%] bg-black/50 blur-2xl"
        aria-hidden
      />
      {/* Soft teal spill — card column only, very restrained */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[88%] w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-teal/[0.04] blur-3xl"
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}
