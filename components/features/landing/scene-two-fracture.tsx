"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

import { HeroAtmosphere } from "@/components/features/landing/hero-atmosphere";
import { SceneTwoArtwork } from "@/components/features/landing/scene-two-artwork";
import { SceneTwoPillars } from "@/components/features/landing/scene-two-pillars";
import { SceneContainer } from "@/components/features/landing/scene-container";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { fadeUpTransition } from "@/lib/motion";

export function SceneTwoFracture() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const inView = useInView(sectionRef, {
    once: true,
    amount: 0.15,
    margin: "-8% 0px",
  });

  const copyVariants = {
    hidden: reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    visible: reducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 },
  };

  return (
    <section
      ref={sectionRef}
      id="scene-two"
      aria-labelledby="scene-two-heading"
      className="relative bg-muted/50 text-foreground dark:bg-background"
    >
      <HeroAtmosphere className="opacity-40 dark:opacity-60" />

      <SceneContainer className="relative flex flex-col items-center pt-16 pb-20 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28">
        <motion.div
          className="mx-auto max-w-[680px] text-center"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: reducedMotion ? 0 : 0.08,
              },
            },
          }}
        >
          <motion.p
            className="font-heading text-xs font-medium tracking-[0.32em] text-fracture-gold/90 uppercase"
            variants={copyVariants}
            transition={fadeUpTransition(reducedMotion, 0)}
          >
            — The Fracture —
          </motion.p>

          <motion.h2
            id="scene-two-heading"
            className="mt-8 font-[family-name:var(--font-display-serif)] text-[2.5rem] leading-[1.12] font-normal tracking-[-0.01em] sm:mt-10 sm:text-[3.25rem] lg:text-[3.75rem]"
            variants={copyVariants}
            transition={fadeUpTransition(reducedMotion, reducedMotion ? 0 : 0.08)}
          >
            <span className="block">
              <span className="text-foreground">Brilliant </span>
              <span className="text-brand-red">alone.</span>
            </span>
            <span className="mt-1 block">
              <span className="text-foreground">Incomplete </span>
              <span className="text-brand-red">apart.</span>
            </span>
          </motion.h2>

          <motion.div
            className="mx-auto mt-8 sm:mt-10"
            variants={copyVariants}
            transition={fadeUpTransition(reducedMotion, reducedMotion ? 0 : 0.16)}
          >
            <p className="mx-auto max-w-[500px] text-lg leading-[1.7] text-muted-foreground sm:text-[17px] lg:max-w-[520px]">
              Healthcare&apos;s biggest breakthroughs require clinical expertise,
              technical execution and business leadership.
            </p>
            <p className="mt-12 font-[family-name:var(--font-display-serif)] text-xl font-semibold leading-snug text-brand-red sm:mt-14 sm:text-[1.375rem]">
              Those people rarely begin at the same table.
            </p>
          </motion.div>
        </motion.div>

        {/* Full-bleed artwork — escapes SceneContainer padding so width changes are visible */}
        <div className="mt-14 w-full sm:mt-16 lg:mt-20">
          <div className="relative left-1/2 w-[min(1126px,calc(100vw-1.25rem))] -translate-x-1/2 sm:w-[min(1126px,calc(100vw-2rem))]">
            <SceneTwoArtwork inView={inView} className="w-full" />
          </div>
        </div>

        <SceneTwoPillars inView={inView} className="mt-14 sm:mt-16 lg:mt-20" />
      </SceneContainer>
    </section>
  );
}
