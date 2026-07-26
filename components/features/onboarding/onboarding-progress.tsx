"use client";

import { motion } from "framer-motion";

import { ONBOARDING_STEP_COUNT } from "@/types/onboarding";
import { cn } from "@/lib/utils";

type OnboardingProgressProps = {
  step: number;
  className?: string;
};

export function OnboardingProgress({ step, className }: OnboardingProgressProps) {
  const progress = ((step + 1) / ONBOARDING_STEP_COUNT) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">
        <span>
          Step {step + 1} of {ONBOARDING_STEP_COUNT}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label={`Onboarding progress, step ${step + 1} of ${ONBOARDING_STEP_COUNT}`}
      >
        <motion.div
          className="h-full rounded-full bg-teal"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>
    </div>
  );
}
