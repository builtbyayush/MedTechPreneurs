"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { memo, useEffect, useRef } from "react";

import { DiscoveryFounderCard } from "@/components/features/discovery/discovery-founder-card";
import {
  SWIPE_COMMIT_THRESHOLD,
  SWIPE_MAX_ROTATION,
  swipeExitSpring,
  swipeSnapBack,
} from "@/lib/motion";
import type { DiscoveryFounder } from "@/types/discovery";
import { cn } from "@/lib/utils";

export type SwipeAction = "pass" | "connect";

type DiscoverySwipeCardProps = {
  founder: DiscoveryFounder;
  disabled?: boolean;
  reducedMotion?: boolean;
  exitDirection: SwipeAction | null;
  restoreSignal?: number;
  onDragCommit?: (action: SwipeAction) => void;
  onExitAnimationComplete?: () => void;
  className?: string;
};

export const DiscoverySwipeCard = memo(function DiscoverySwipeCard({
  founder,
  disabled = false,
  reducedMotion = false,
  exitDirection,
  restoreSignal = 0,
  onDragCommit,
  onExitAnimationComplete,
  className,
}: DiscoverySwipeCardProps) {
  const x = useMotionValue(0);
  const onCompleteRef = useRef(onExitAnimationComplete);

  useEffect(() => {
    onCompleteRef.current = onExitAnimationComplete;
  }, [onExitAnimationComplete]);
  const rotate = useTransform(
    x,
    [-220, 0, 220],
    [-SWIPE_MAX_ROTATION, 0, SWIPE_MAX_ROTATION],
  );
  const scale = useTransform(x, [-180, 0, 180], [0.97, 1, 0.97]);
  const cardOpacity = useTransform(
    x,
    [-260, -120, 0, 120, 260],
    [0.85, 1, 1, 1, 0.85],
  );

  const passBadgeOpacity = useTransform(
    x,
    [-160, -SWIPE_COMMIT_THRESHOLD, -24, 0],
    [1, 0.85, 0.15, 0],
  );
  const connectBadgeOpacity = useTransform(
    x,
    [0, 24, SWIPE_COMMIT_THRESHOLD, 160],
    [0, 0.15, 0.85, 1],
  );
  const passOverlayOpacity = useTransform(x, [-180, 0], [0.22, 0]);
  const connectOverlayOpacity = useTransform(x, [0, 180], [0, 0.18]);

  useEffect(() => {
    x.set(0);
  }, [founder.id, x]);

  useEffect(() => {
    if (restoreSignal === 0) {
      return;
    }

    void animate(x, 0, swipeSnapBack);
  }, [restoreSignal, x]);

  useEffect(() => {
    if (!exitDirection) {
      return;
    }

    let cancelled = false;
    const targetX = exitDirection === "pass" ? -520 : 520;

    void animate(x, targetX, reducedMotion ? { duration: 0 } : swipeExitSpring).then(
      () => {
        if (!cancelled) {
          onCompleteRef.current?.();
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [exitDirection, reducedMotion, x]);

  async function handleDragEnd(
    _: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number } },
  ) {
    if (disabled || reducedMotion || exitDirection) {
      return;
    }

    const offsetX = info.offset.x;

    if (offsetX >= SWIPE_COMMIT_THRESHOLD) {
      onDragCommit?.("connect");
      return;
    }

    if (offsetX <= -SWIPE_COMMIT_THRESHOLD) {
      onDragCommit?.("pass");
      return;
    }

    await animate(x, 0, swipeSnapBack);
  }

  const dragEnabled = !disabled && !reducedMotion && !exitDirection;

  return (
    <motion.div
      className={cn("relative touch-none", className)}
      style={{
        x,
        rotate,
        scale,
        opacity: cardOpacity,
      }}
      drag={dragEnabled ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      aria-label={`Swipe card for ${founder.name}. Drag left to pass, right to connect.`}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-coral/80"
        style={{ opacity: passOverlayOpacity }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-teal/70"
        style={{ opacity: connectOverlayOpacity }}
        aria-hidden
      />

      <motion.div
        className="pointer-events-none absolute top-8 left-5 z-20 rounded-lg border-2 border-coral px-3 py-1.5 font-heading text-lg font-black tracking-[0.12em] text-coral uppercase"
        style={{ opacity: passBadgeOpacity, rotate: -12 }}
        aria-hidden
      >
        Pass
      </motion.div>
      <motion.div
        className="pointer-events-none absolute top-8 right-5 z-20 rounded-lg border-2 border-teal px-3 py-1.5 font-heading text-lg font-black tracking-[0.12em] text-teal uppercase"
        style={{ opacity: connectBadgeOpacity, rotate: 12 }}
        aria-hidden
      >
        Connect
      </motion.div>

      <DiscoveryFounderCard founder={founder} />
    </motion.div>
  );
});
