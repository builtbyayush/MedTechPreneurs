"use client";

import { motion } from "framer-motion";
import { BookOpen, Clock, ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/features/app/empty-state";
import { PageContainer } from "@/components/features/app/page-container";
import { SectionHeader } from "@/components/features/app/section-header";
import { Input } from "@/components/ui/input";
import {
  filterToolkitResources,
  TOOLKIT_CATEGORIES,
  TOOLKIT_CATEGORY_LABELS,
  type ToolkitCategory,
  type ToolkitResource,
} from "@/constants/toolkit";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { fadeUp, fadeUpTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function ToolkitFeed() {
  const reducedMotion = usePrefersReducedMotion();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolkitCategory | "all">("all");

  const resources = useMemo(
    () => filterToolkitResources({ query, category }),
    [query, category],
  );

  return (
    <PageContainer className="space-y-6 pb-28">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={fadeUpTransition(reducedMotion, 0)}
      >
        <SectionHeader
          title="Founder's Toolkit"
          description="Curated resources for regulated healthcare startups in India."
        />

        <div className="founder-card-glass rounded-2xl border border-white/10 p-4 shadow-founder-card">
          <label className="sr-only" htmlFor="toolkit-search">
            Search toolkit
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40"
              aria-hidden
            />
            <Input
              id="toolkit-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title or topic"
              className="border-white/10 bg-white/[0.03] pl-9 text-white placeholder:text-white/40"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <CategoryChip
              label="All"
              active={category === "all"}
              onClick={() => setCategory("all")}
            />
            {TOOLKIT_CATEGORIES.map((item) => (
              <CategoryChip
                key={item}
                label={TOOLKIT_CATEGORY_LABELS[item]}
                active={category === item}
                onClick={() => setCategory(item)}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {resources.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No resources found"
          description="Try another search term or category filter."
        />
      ) : (
        <div className="space-y-3">
          {resources.map((resource, index) => (
            <ToolkitResourceCard
              key={resource.id}
              resource={resource}
              index={index}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
        active
          ? "border-teal/40 bg-teal/15 text-teal"
          : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.06]",
      )}
    >
      {label}
    </button>
  );
}

function ToolkitResourceCard({
  resource,
  index,
}: {
  resource: ToolkitResource;
  index: number;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const content = (
    <div className="founder-card-glass rounded-2xl border border-white/10 p-4 shadow-founder-card transition-colors hover:bg-white/[0.03]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-[0.16em] text-teal uppercase">
            {TOOLKIT_CATEGORY_LABELS[resource.category]}
          </p>
          <h3 className="mt-1 font-heading text-base font-extrabold text-white">
            {resource.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            {resource.description}
          </p>
        </div>
        {resource.external ? (
          <ExternalLink className="size-4 shrink-0 text-white/35" aria-hidden />
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-white/55">
          <Clock className="size-3" aria-hidden />
          {resource.readingTimeMinutes} min read
        </span>
        <span className="rounded-full border border-teal/20 bg-teal/10 px-2 py-1 font-semibold text-teal">
          {resource.tag}
        </span>
      </div>
    </div>
  );

  return (
    <motion.div
      id={resource.id}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      transition={fadeUpTransition(reducedMotion, 0.04 * index)}
    >
      {resource.external ? (
        <a
          href={resource.href}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          {content}
        </a>
      ) : (
        <Link
          href={resource.href}
          className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          {content}
        </Link>
      )}
    </motion.div>
  );
}
