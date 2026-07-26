import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type OnboardingOptionCardProps = {
  label: string;
  selected?: boolean;
  onSelect: () => void;
  mode?: "single" | "multiple";
  className?: string;
};

export function OnboardingOptionCard({
  label,
  selected = false,
  onSelect,
  mode = "single",
  className,
}: OnboardingOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal",
        selected
          ? "border-teal/50 bg-teal/10 text-white shadow-[0_0_0_1px_rgb(0_204_204/0.15)]"
          : "border-white/10 bg-white/[0.03] text-white/85 hover:border-white/20 hover:bg-white/[0.05]",
        className,
      )}
    >
      <span className="font-heading text-base font-semibold tracking-tight sm:text-lg">
        {label}
      </span>
      <span
        className={cn(
          "inline-flex size-6 items-center justify-center rounded-full border transition-colors",
          selected
            ? "border-teal bg-teal text-ink"
            : "border-white/20 bg-transparent text-transparent",
          mode === "single" && !selected && "rounded-full",
        )}
        aria-hidden
      >
        {selected ? <Check className="size-3.5" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}
