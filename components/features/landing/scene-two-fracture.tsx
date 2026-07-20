"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

import { HeroAtmosphere } from "@/components/features/landing/hero-atmosphere";
import { SceneTwoArtwork } from "@/components/features/landing/scene-two-artwork";
import { SceneTwoPillars } from "@/components/features/landing/scene-two-pillars";
import { SceneContainer } from "@/components/features/landing/scene-container";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { EASE_OUT, fadeUpTransition } from "@/lib/motion";

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
      className="relative bg-ink text-white"
    >
      <HeroAtmosphere className="opacity-60" />

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
            className="font-heading text-[10px] font-medium tracking-[0.32em] text-fracture-gold/90 uppercase sm:text-[11px]"
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
              <span className="text-white">Brilliant </span>
              <span className="text-coral">alone.</span>
            </span>
            <span className="mt-1 block">
              <span className="text-white">Incomplete </span>
              <span className="text-coral">apart.</span>
            </span>
          </motion.h2>

          <motion.div
            className="mx-auto mt-8 sm:mt-10"
            variants={copyVariants}
            transition={fadeUpTransition(reducedMotion, reducedMotion ? 0 : 0.16)}
          >
            <p className="mx-auto max-w-[500px] text-base leading-[1.7] text-white/50 sm:text-[17px] lg:max-w-[520px]">
              Healthcare&apos;s biggest breakthroughs require clinical expertise,
              technical execution and business leadership.
            </p>
            <p className="mt-12 font-[family-name:var(--font-display-serif)] text-[1.25rem] font-semibold leading-snug text-coral sm:mt-14 sm:text-[1.375rem]">
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
