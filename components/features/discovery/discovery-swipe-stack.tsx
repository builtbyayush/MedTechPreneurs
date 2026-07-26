"use client";

import { motion } from "framer-motion";

import { DiscoveryCardSkeleton } from "@/components/features/discovery/discovery-card-skeleton";
import {
  DiscoverySwipeCard,
  type SwipeAction,
} from "@/components/features/discovery/discovery-swipe-card";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { DiscoveryFounder } from "@/types/discovery";
import { cn } from "@/lib/utils";

type DiscoverySwipeStackProps = {
  founder: DiscoveryFounder;
  isLoadingNext: boolean;
  isSubmitting: boolean;
  exitDirection: SwipeAction | null;
  restoreSignal: number;
  onAction: (action: SwipeAction) => void;
  onExitAnimationComplete: () => void;
  className?: string;
};

export function DiscoverySwipeStack({
  founder,
  isLoadingNext,
  isSubmitting,
  exitDirection,
  restoreSignal,
  onAction,
  onExitAnimationComplete,
  className,
}: DiscoverySwipeStackProps) {
  const reducedMotion = usePrefersReducedMotion();
  const isExiting = exitDirection !== null;

  return (
    <div
      className={cn("relative mx-auto w-full max-w-md", className)}
      style={{ minHeight: "520px" }}
      aria-live="polite"
      aria-busy={isLoadingNext || isSubmitting}
    >
      {/* Under-stack: skeleton preview (next founder preloaded after action only) */}
      <motion.div
        className="absolute inset-x-0 top-2 z-0 origin-top"
        initial={false}
        animate={{
          scale: isExiting || isLoadingNext ? 1 : 0.96,
          opacity: isExiting || isLoadingNext ? 1 : 0.55,
          y: isExiting || isLoadingNext ? 0 : 8,
        }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 320, damping: 32 }
        }
        aria-hidden
      >
        <DiscoveryCardSkeleton className="pointer-events-none" />
      </motion.div>

      {/* Top card or loading skeleton */}
      <div className="relative z-10">
        {isLoadingNext ? (
          <div aria-label="Loading next founder">
            <DiscoveryCardSkeleton />
          </div>
        ) : (
          <DiscoverySwipeCard
            key={founder.id}
            founder={founder}
            disabled={isSubmitting}
            reducedMotion={reducedMotion}
            exitDirection={exitDirection}
            restoreSignal={restoreSignal}
            onDragCommit={onAction}
            onExitAnimationComplete={onExitAnimationComplete}
          />
        )}
      </div>
    </div>
  );
}
