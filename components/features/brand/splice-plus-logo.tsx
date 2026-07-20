import { SplicePlusMark } from "@/components/features/brand/splice-plus-mark";
import { cn } from "@/lib/utils";

type SplicePlusLogoProps = {
  className?: string;
  /** "Splice" color — defaults to teal for dark nav / light auth shells. */
  spliceClassName?: string;
};

/** Full Splice+ logo — heading weight; "+" always brand red. */
export function SplicePlusLogo({
  className,
  spliceClassName = "text-teal",
}: SplicePlusLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-heading font-extrabold tracking-tight",
        className
      )}
      aria-label="Splice+"
    >
      <SplicePlusMark spliceClassName={spliceClassName} />
    </span>
  );
}
