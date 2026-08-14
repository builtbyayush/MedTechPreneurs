"use client";

import { Code2, Stethoscope, TrendingUp, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Pillar = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const PILLARS: Pillar[] = [
  {
    icon: Stethoscope,
    title: "Clinical Expertise",
    description: "Understands the problem in depth.",
  },
  {
    icon: Code2,
    title: "Technical Execution",
    description: "Builds the technology that solves it.",
  },
  {
    icon: TrendingUp,
    title: "Business Building",
    description: "Turns ideas into impact at scale.",
  },
];

type SceneTwoPillarsProps = {
  inView?: boolean;
  className?: string;
};

export function SceneTwoPillars({ inView = true, className }: SceneTwoPillarsProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      className={cn(
        "mx-auto grid max-w-[880px] grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-0",
        className
      )}
    >
      {PILLARS.map((pillar, index) => (
        <motion.div
          key={pillar.title}
          className={cn(
            "flex flex-col items-center px-4 text-center sm:px-6",
            index > 0 && "sm:border-l sm:border-border"
          )}
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{
            duration: 0.45,
            delay: reducedMotion ? 0 : 0.55 + index * 0.1,
            ease: EASE_OUT,
          }}
        >
          <div
            className="flex size-11 items-center justify-center rounded-full border border-teal/40 text-teal-text dark:text-teal"
            aria-hidden
          >
            <pillar.icon className="size-[18px] stroke-[1.5]" />
          </div>
          <p className="mt-5 font-heading text-xs font-bold tracking-[0.2em] text-teal-text uppercase dark:text-teal">
            {pillar.title}
          </p>
          <p className="mt-2 max-w-[220px] text-base leading-relaxed text-muted-foreground">
            {pillar.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
