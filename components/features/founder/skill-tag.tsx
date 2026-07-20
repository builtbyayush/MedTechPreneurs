import { cn } from "@/lib/utils";

type SkillTagProps = {
  label: string;
  className?: string;
};

export function SkillTag({ label, className }: SkillTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium tracking-wide text-white/80",
        className
      )}
    >
      <span className="size-1 shrink-0 rounded-full bg-teal/70" aria-hidden />
      {label}
    </span>
  );
}
