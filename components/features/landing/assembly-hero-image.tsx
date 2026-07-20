"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const ASSEMBLY_IMAGE = {
  src: "/images/landing/scene-three-assembly-reveal.png",
  width: 1024,
  height: 590,
  alt: "Three complementary founders collaborating at the same table — Clinical Expert, Business Builder, and AI/ML Engineer with complementarity match scores and Stronger Together annotation.",
} as const;

type AssemblyHeroImageProps = {
  inView?: boolean;
  className?: string;
};

export function AssemblyHeroImage({
  inView = true,
  className,
}: AssemblyHeroImageProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <figure
      className={cn("assembly-reveal-blend relative w-full", className)}
      aria-labelledby="scene-three-heading"
    >
      <motion.div
        className="relative w-full"
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.75, delay: reducedMotion ? 0 : 0.12, ease: EASE_OUT }}
      >
        <Image
          src={ASSEMBLY_IMAGE.src}
          alt={ASSEMBLY_IMAGE.alt}
          width={ASSEMBLY_IMAGE.width}
          height={ASSEMBLY_IMAGE.height}
          sizes="(max-width: 1024px) 100vw, 62vw"
          className="h-auto w-full"
          priority={false}
        />
      </motion.div>

      <figcaption className="sr-only">
        Three verified founders matched by complementarity, collaborating at the
        same table.
      </figcaption>
    </figure>
  );
}
