import type { Transition, Variants } from "framer-motion";

export const EASE_OUT = [0.25, 0.1, 0.25, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export const fadeOut: Variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

export const motionTransition = {
  fast: { duration: 0.2, ease: EASE_OUT } satisfies Transition,
  medium: { duration: 0.4, ease: EASE_OUT } satisfies Transition,
  nav: { duration: 0.2, ease: EASE_OUT } satisfies Transition,
};

export const springPress = {
  type: "spring" as const,
  stiffness: 420,
  damping: 22,
};

/** Returns true when user prefers reduced motion — use to skip transforms. */
export function getReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function fadeUpTransition(reducedMotion: boolean, delay = 0): Transition {
  if (reducedMotion) {
    return { duration: 0, delay: 0 };
  }
  return { ...motionTransition.medium, delay };
}
