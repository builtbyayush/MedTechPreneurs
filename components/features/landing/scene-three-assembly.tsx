"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

import { SplicePlusMark } from "@/components/features/brand/splice-plus-mark";
import { AssemblyHeroImage } from "@/components/features/landing/assembly-hero-image";
import { Kicker } from "@/components/features/landing/kicker";
import { SceneContainer } from "@/components/features/landing/scene-container";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { fadeUpTransition } from "@/lib/motion";

const CAPABILITIES = [
  "Clinical Expertise",
  "Technical Execution",
  "Business Leadership",
] as const;

export function SceneThreeAssembly() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const inView = useInView(sectionRef, {
    once: true,
    amount: 0.2,
    margin: "-8% 0px",
  });

  const copyVariants = {
    hidden: reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    visible: reducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 },
  };

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      aria-labelledby="scene-three-heading"
      className="relative bg-background text-foreground"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-muted/80 to-transparent dark:from-background sm:h-32"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-muted/40 to-transparent dark:from-background sm:h-32"
        aria-hidden
      />

      <SceneContainer className="relative pt-16 pb-20 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28">
        <div className="grid items-center gap-12 sm:gap-14 lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)] lg:gap-x-16 xl:gap-x-20">
          <motion.div
            className="max-w-[520px] lg:max-w-[460px]"
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
            <motion.div variants={copyVariants} transition={fadeUpTransition(reducedMotion, 0)}>
              <Kicker>The assembly</Kicker>
            </motion.div>

            <motion.h2
              id="scene-three-heading"
              className="mt-8 font-heading text-[2.125rem] leading-[1.08] font-black tracking-tight text-foreground sm:mt-10 sm:text-[2.5rem] lg:text-[2.75rem] xl:text-[3rem]"
              variants={copyVariants}
              transition={fadeUpTransition(reducedMotion, reducedMotion ? 0 : 0.08)}
            >
              <SplicePlusMark /> brings the right people to the same table.
            </motion.h2>

            <motion.ul
              className="mt-10 space-y-3.5 sm:mt-12 sm:space-y-4"
              variants={copyVariants}
              transition={fadeUpTransition(reducedMotion, reducedMotion ? 0 : 0.16)}
            >
              {CAPABILITIES.map((line) => (
                <li
                  key={line}
                  className="font-heading text-sm font-bold tracking-[0.12em] text-foreground/80 uppercase"
                >
                  {line}
                </li>
              ))}
            </motion.ul>

            <motion.p
              className="mt-10 max-w-[440px] text-lg leading-[1.7] text-muted-foreground sm:mt-12 sm:text-[17px]"
              variants={copyVariants}
              transition={fadeUpTransition(reducedMotion, reducedMotion ? 0 : 0.24)}
            >
              <SplicePlusMark /> identifies complementary founders and assembles healthcare
              teams built to solve meaningful problems.
            </motion.p>
          </motion.div>

          <div className="relative flex justify-center lg:justify-start">
            <AssemblyHeroImage inView={inView} className="w-full" />
          </div>
        </div>
      </SceneContainer>
    </section>
  );
}
