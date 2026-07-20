"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SCENE_TWO_ARTWORK = {
  src: "/images/landing/scene-two-workspace.png",
  width: 1024,
  height: 593,
  alt: "A dark innovation workspace with an empty collaboration table at its center, while a doctor, strategist, and engineer work alone at the edges of the room — never together.",
} as const;

type SceneTwoArtworkProps = {
  className?: string;
  inView?: boolean;
};

/**
 * Scene 2 editorial illustration — first-class asset.
 * React handles presentation only; the artwork carries the narrative.
 */
export function SceneTwoArtwork({
  className,
  inView = true,
}: SceneTwoArtworkProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <figure
      className={cn("relative w-full", className)}
      aria-labelledby="scene-two-heading"
    >
      <motion.div
        className="relative w-full overflow-hidden"
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{
          duration: reducedMotion ? 0 : 0.65,
          delay: reducedMotion ? 0 : 0.42,
          ease: EASE_OUT,
        }}
      >
        <Image
          src={SCENE_TWO_ARTWORK.src}
          alt={SCENE_TWO_ARTWORK.alt}
          width={SCENE_TWO_ARTWORK.width}
          height={SCENE_TWO_ARTWORK.height}
          sizes="(max-width: 640px) calc(100vw - 1.25rem), (max-width: 1024px) calc(100vw - 2rem), 1126px"
          className="h-auto w-full opacity-[0.97] brightness-[0.98] contrast-[0.99]"
          priority={false}
        />

        {/* Light edge blend only — don't recess the artwork */}
        <div
          className="pointer-events-none absolute inset-0 bg-ink/[0.02]"
          aria-hidden
        />

        {/* Blend artwork into ink canvas */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[14%] bg-gradient-to-t from-ink via-ink/70 to-transparent"
          aria-hidden
        />
      </motion.div>

      <figcaption className="sr-only">
        Editorial scene: healthcare innovators isolated in the same workspace
        around a central table — the fracture Splice exists to close.
      </figcaption>
    </figure>
  );
}
