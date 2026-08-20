"use client";

import { motion } from "framer-motion";
import { Handshake, TrendingUp, type LucideIcon } from "lucide-react";

import { SectionHeader } from "@/components/features/app/section-header";
import { HOME_UPCOMING_EVENT_CATEGORIES } from "@/constants/home";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { fadeUp, fadeUpTransition } from "@/lib/motion";
import type { HomeUpcomingEventCategoryId } from "@/types/home";

const EVENT_CATEGORY_ICONS: Record<HomeUpcomingEventCategoryId, LucideIcon> = {
  networking: Handshake,
  fundraising: TrendingUp,
};

export function UpcomingEventsSection() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      transition={fadeUpTransition(reducedMotion, 0.32)}
      aria-labelledby="upcoming-events-heading"
    >
      <SectionHeader title="Upcoming events" titleId="upcoming-events-heading" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {HOME_UPCOMING_EVENT_CATEGORIES.map((category, index) => {
          const Icon = EVENT_CATEGORY_ICONS[category.id];

          return (
            <motion.div
              key={category.id}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={fadeUpTransition(reducedMotion, 0.34 + index * 0.04)}
            >
              <article
                aria-label={`${category.label}: Coming soon`}
                className="founder-card-glass flex h-full min-h-[7.5rem] flex-col rounded-2xl border border-border p-4 shadow-founder-card"
              >
                <div className="mb-3 inline-flex size-9 items-center justify-center rounded-xl border border-teal/20 bg-teal/10 text-teal">
                  <Icon className="size-4" aria-hidden />
                </div>
                <h3 className="font-heading text-sm font-bold text-foreground">
                  {category.label}
                </h3>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-teal">
                  Coming soon
                </p>
              </article>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
