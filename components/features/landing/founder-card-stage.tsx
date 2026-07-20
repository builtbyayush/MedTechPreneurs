"use client";

import { motion } from "framer-motion";

import {
  FOUNDER_CARD_HERO_WIDTH,
  FOUNDER_CARD_SEQUENCE,
} from "@/components/features/founder/founder-card-reveal";
import { FounderCardReveal } from "@/components/features/founder/founder-card-reveal";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

type FounderCardStageProps = {
  inView: boolean;
  className?: string;
};

export function FounderCardStage({ inView, className }: FounderCardStageProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[min(96vw,800px)] sm:max-w-[min(92vw,840px)] lg:max-w-none",
        className
      )}
    >
      <div className="relative flex items-center justify-center overflow-visible py-2 sm:py-4 lg:py-6">
        <div
          className="founder-card-hero-glow pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[min(118%,920px)] -translate-x-1/2 -translate-y-1/2"
          aria-hidden
        />

        <div
          className="relative w-full lg:w-[min(920px,72vw)] xl:w-[900px]"
          style={{ maxWidth: FOUNDER_CARD_HERO_WIDTH }}
        >
          <div className="founder-card-perspective relative">
            <motion.div
              initial={
                reducedMotion
                  ? { opacity: 1, y: 0, rotateX: -2, rotateY: 3 }
                  : { opacity: 0, y: 36, rotateX: -2, rotateY: 3 }
              }
              animate={
                inView
                  ? { opacity: 1, y: 0, rotateX: -2, rotateY: 3 }
                  : reducedMotion
                    ? { opacity: 1, y: 0, rotateX: -2, rotateY: 3 }
                    : { opacity: 0, y: 36, rotateX: -2, rotateY: 3 }
              }
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : {
                      duration: 0.95,
                      delay: FOUNDER_CARD_SEQUENCE.card,
                      ease: EASE_OUT,
                    }
              }
              className="founder-card-float relative will-change-transform lg:[transform-style:preserve-3d]"
            >
              <FounderCardReveal />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
