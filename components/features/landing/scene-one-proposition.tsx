"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useRef } from "react";

import { HeroAtmosphere } from "@/components/features/landing/hero-atmosphere";
import { Kicker } from "@/components/features/landing/kicker";
import { SceneOneHeadline } from "@/components/features/landing/scene-one-headline";
import {
  LandingCtaLink,
  LandingCtaPrimary,
} from "@/components/features/landing/landing-cta";
import { MatchSurfaceShowcase } from "@/components/features/landing/match-surface-showcase";
import { MatchSurfaceStage } from "@/components/features/landing/match-surface-stage";
import { SceneContainer } from "@/components/features/landing/scene-container";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { fadeUp, fadeUpTransition } from "@/lib/motion";

export function SceneOneProposition() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const showcaseOpacity = useTransform(
    scrollYProgress,
    [0, 0.2],
    reducedMotion ? [1, 1] : [1, 0]
  );

  const copyVariants = {
    hidden: reducedMotion ? { opacity: 1, y: 0 } : fadeUp.hidden,
    visible: reducedMotion ? { opacity: 1, y: 0 } : fadeUp.visible,
  };

  const showcaseVariants = {
    hidden: reducedMotion ? { opacity: 1, y: 0 } : fadeUp.hidden,
    visible: reducedMotion ? { opacity: 1, y: 0 } : fadeUp.visible,
  };

  return (
    <section
      ref={sectionRef}
      id="scene-one"
      aria-labelledby="scene-one-heading"
      className="relative min-h-[100svh] bg-ink text-white"
    >
      <HeroAtmosphere />

      <SceneContainer className="relative flex min-h-[100svh] flex-col pt-[4.5rem]">
        <div className="flex flex-1 flex-col justify-center py-16 sm:py-20 lg:py-24 xl:pt-28 xl:pb-28">
          <div className="grid items-center gap-12 sm:gap-14 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-24">
            <motion.div
              className="max-w-[540px] lg:max-w-[520px]"
              initial="hidden"
              animate="visible"
              variants={copyVariants}
              transition={fadeUpTransition(reducedMotion, 0)}
            >
              <Kicker>By MedTechPreneurs</Kicker>

              <SceneOneHeadline id="scene-one-heading" />

              <p className="mt-6 max-w-[640px] text-lg leading-[1.65] text-white/75 lg:mt-8">
                Whether you are a Startup, Medical Institution, or an Investor
                — Join us to help Bridge the Gap between Technology &amp;
                Healthcare
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:flex-wrap sm:items-center lg:mt-14">
                <LandingCtaPrimary href="/register" size="lg" className="w-full sm:w-auto">
                  Get started
                </LandingCtaPrimary>
                <LandingCtaLink href="/login" className="text-center sm:text-left">
                  Log in
                </LandingCtaLink>
              </div>
            </motion.div>

            <motion.div
              className="flex justify-center px-2 sm:px-4 lg:justify-end lg:px-0 xl:pr-6"
              initial="hidden"
              animate="visible"
              variants={showcaseVariants}
              transition={fadeUpTransition(reducedMotion, reducedMotion ? 0 : 0.2)}
              style={{ opacity: showcaseOpacity }}
            >
              <MatchSurfaceStage>
                <MatchSurfaceShowcase />
              </MatchSurfaceStage>
            </motion.div>
          </div>

          <motion.p
            className="mt-14 flex items-center justify-center gap-1.5 text-[11px] tracking-wide text-white/35 sm:mt-16 lg:mt-20 lg:justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: reducedMotion ? 1 : 0.4 }}
            transition={
              reducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.8 }
            }
            aria-hidden
          >
            <ChevronDown className="size-3.5" />
            Scroll
          </motion.p>
        </div>
      </SceneContainer>
    </section>
  );
}
