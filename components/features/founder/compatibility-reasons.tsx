import { cn } from "@/lib/utils";

type CompatibilityReasonsProps = {
  reasons: string[];
  className?: string;
};

export function CompatibilityReasons({
  reasons,
  className,
}: CompatibilityReasonsProps) {
  if (reasons.length === 0) {
    return null;
  }

  return (
    <ul
      className={cn("space-y-1.5 text-sm leading-relaxed text-white/65", className)}
      aria-label="Top compatibility reasons"
    >
      {reasons.map((reason) => (
        <li key={reason} className="flex gap-2">
          <span className="mt-2 size-1 shrink-0 rounded-full bg-teal/80" aria-hidden />
          <span>{reason}</span>
        </li>
      ))}
    </ul>
  );
}
