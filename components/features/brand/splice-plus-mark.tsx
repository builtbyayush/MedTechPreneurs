import { cn } from "@/lib/utils";

type SplicePlusMarkProps = {
  className?: string;
  /** Color for "Splice" — omit to inherit the parent text color. */
  spliceClassName?: string;
};

/** Splice+ wordmark fragment — "+" is always brand red; "Splice" follows context. */
export function SplicePlusMark({
  className,
  spliceClassName,
}: SplicePlusMarkProps) {
  return (
    <span className={cn("inline", className)}>
      <span className={cn(spliceClassName)}>Splice</span>
      <span className="splice-plus-cross text-brand-red" aria-hidden>
        +
      </span>
    </span>
  );
}
