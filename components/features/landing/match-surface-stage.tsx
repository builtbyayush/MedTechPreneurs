import { cn } from "@/lib/utils";

type MatchSurfaceStageProps = {
  children: React.ReactNode;
  className?: string;
};

/** Depth platform for the Scene 1 marketing showcase — flat, no tilt. */
export function MatchSurfaceStage({ children, className }: MatchSurfaceStageProps) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[440px]", className)}>
      <div
        className="pointer-events-none absolute -bottom-4 left-1/2 h-8 w-[76%] -translate-x-1/2 rounded-[100%] bg-black/35 blur-[28px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-1 left-1/2 h-3 w-[52%] -translate-x-1/2 rounded-[100%] bg-teal/[0.07] blur-xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-[38%] left-1/2 h-[70%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-teal/[0.035] blur-[56px]"
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}
