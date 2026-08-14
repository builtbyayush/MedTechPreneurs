import { cn } from "@/lib/utils";

type SkillTagProps = {
  label: string;
  className?: string;
};

export function SkillTag({ label, className }: SkillTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1.5 text-[11px] font-medium tracking-wide text-muted-foreground",
        className
      )}
    >
      <span className="size-1 shrink-0 rounded-full bg-teal/70" aria-hidden />
      {label}
    </span>
  );
}
