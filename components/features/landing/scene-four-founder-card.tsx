"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

import { FounderCardStage } from "@/components/features/landing/founder-card-stage";
import { Kicker } from "@/components/features/landing/kicker";
import { SceneContainer } from "@/components/features/landing/scene-container";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { fadeUpTransition } from "@/lib/motion";

export function SceneFourFounderCard() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const inView = useInView(sectionRef, {
    once: true,
    amount: 0.22,
    margin: "-8% 0px",
  });

  const copyVariants = {
    hidden: reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    visible: reducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 },
  };

  return (
    <section
      ref={sectionRef}
      id="founder-card"
      aria-labelledby="scene-four-heading"
      className="relative overflow-x-clip overflow-y-visible bg-founder-reveal text-white"
    >
      {/* Soft blend from adjacent ink sections */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink to-founder-reveal sm:h-32"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink to-founder-reveal sm:h-32"
        aria-hidden
      />

      <SceneContainer className="relative pt-16 pb-20 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32">
        <div className="grid items-center gap-12 sm:gap-14 lg:grid-cols-[minmax(0,48fr)_minmax(0,52fr)] lg:gap-x-10 xl:gap-x-14">
          <motion.div
            className="relative z-[1] max-w-[540px] lg:max-w-[480px]"
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
            <motion.div
              variants={copyVariants}
              transition={fadeUpTransition(reducedMotion, 0)}
            >
              <Kicker>The founder card</Kicker>
            </motion.div>

            <motion.h2
              id="scene-four-heading"
              className="mt-8 font-heading text-[2rem] leading-[1.1] font-black tracking-tight text-white sm:mt-10 sm:text-[2.35rem] lg:text-[2.5rem] xl:text-[2.65rem]"
              variants={copyVariants}
              transition={fadeUpTransition(reducedMotion, reducedMotion ? 0 : 0.08)}
            >
              Every profile is built for one purpose.
              <span className="mt-2 block text-brand-red">
                Finding the teammate you don&apos;t already have.
              </span>
            </motion.h2>

            <motion.p
              className="mt-10 max-w-[460px] text-base leading-[1.72] text-white/50 sm:mt-12 sm:text-[17px]"
              variants={copyVariants}
              transition={fadeUpTransition(reducedMotion, reducedMotion ? 0 : 0.16)}
            >
              LinkedIn was built to impress recruiters with everything you&apos;ve
              done. A Founder Card is built to find who you still need — verified
              credentials, a compatibility score, and the role you&apos;re actively
              seeking. Not a résumé. A co-founder signal.
            </motion.p>
          </motion.div>

          <FounderCardStage inView={inView} className="relative z-0 lg:-mr-6 lg:justify-self-end xl:-mr-10" />
        </div>
      </SceneContainer>
    </section>
  );
}
