"use client";

import { motion } from "framer-motion";
import { useId } from "react";

import { CategoryBadge } from "@/components/features/founder/category-badge";
import { VerifiedBadge } from "@/components/features/founder/verified-badge";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

type EditorialPortraitProps = {
  variant: "primary" | "complement";
  className?: string;
  alt: string;
};

function EditorialPortrait({ variant, className, alt }: EditorialPortraitProps) {
  const isPrimary = variant === "primary";
  const figureGradientId = useId();
  const rimGradientId = useId();

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[#0a1628]",
        isPrimary ? "size-full" : "size-[4.25rem] shrink-0 rounded-[10px]",
        className
      )}
      role="img"
      aria-label={alt}
    >
      {/* Base mesh */}
      <div
        className="absolute inset-0"
        style={{
          background: isPrimary
            ? `radial-gradient(ellipse 85% 65% at 22% 12%, color-mix(in srgb, var(--color-teal) 20%, transparent), transparent 58%),
               radial-gradient(ellipse 55% 40% at 92% 88%, color-mix(in srgb, var(--color-deep-blue) 32%, transparent), transparent 52%),
               linear-gradient(172deg, #0b1829 0%, #0f2844 46%, #0a1524 100%)`
            : `radial-gradient(ellipse 90% 80% at 24% 18%, color-mix(in srgb, var(--color-teal) 14%, transparent), transparent 58%),
               linear-gradient(155deg, #0a1524 0%, #132842 100%)`,
        }}
      />

      {/* Key light — upper left */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isPrimary
            ? "radial-gradient(ellipse 50% 42% at 18% 8%, rgb(255 255 255 / 0.07), transparent 70%)"
            : "radial-gradient(circle at 28% 22%, rgb(255 255 255 / 0.06), transparent 55%)",
        }}
      />

      <div
        className={cn(
          "absolute inset-0 landing-noise mix-blend-overlay",
          isPrimary ? "opacity-[0.22]" : "opacity-[0.18]"
        )}
      />

      {/* Vignette */}
      {isPrimary ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 95% 88% at 50% 42%, transparent 42%, rgb(0 0 0 / 0.35) 100%)",
          }}
        />
      ) : null}

      <svg
        viewBox={isPrimary ? "0 0 440 272" : "0 0 160 160"}
        className="absolute inset-0 size-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <linearGradient id={figureGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(255 255 255 / 0.26)" />
            <stop offset="55%" stopColor="rgb(255 255 255 / 0.14)" />
            <stop offset="100%" stopColor="rgb(255 255 255 / 0.05)" />
          </linearGradient>
          <linearGradient id={rimGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(255 255 255 / 0.12)" />
            <stop offset="100%" stopColor="rgb(255 255 255 / 0)" />
          </linearGradient>
        </defs>
        {isPrimary ? (
          <>
            <ellipse cx="220" cy="86" rx="50" ry="56" fill={`url(#${figureGradientId})`} />
            <path
              d="M 88 272 Q 88 172 220 132 Q 352 172 352 272 Z"
              fill={`url(#${figureGradientId})`}
            />
            <path
              d="M 168 238 L 220 268 L 272 238 L 258 272 L 182 272 Z"
              fill="rgb(255 255 255 / 0.035)"
            />
            <ellipse
              cx="220"
              cy="86"
              rx="50"
              ry="56"
              fill="none"
              stroke={`url(#${rimGradientId})`}
              strokeWidth="0.75"
            />
          </>
        ) : (
          <>
            <ellipse cx="108" cy="58" rx="34" ry="38" fill={`url(#${figureGradientId})`} />
            <path
              d="M 48 160 Q 48 98 108 78 Q 168 98 168 160 Z"
              fill={`url(#${figureGradientId})`}
            />
          </>
        )}
      </svg>

      {/* Edge catches */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {!isPrimary ? (
        <div className="pointer-events-none absolute inset-0 rounded-[10px] ring-1 ring-white/[0.08] ring-inset" />
      ) : null}
    </div>
  );
}

type MatchSurfaceShowcaseProps = {
  className?: string;
};

/**
 * Scene 1 marketing showcase — Person → Compatibility → Missing Teammate.
 * Not the app Founder Card; visual iteration expected.
 */
export function MatchSurfaceShowcase({ className }: MatchSurfaceShowcaseProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <figure
      className={cn("w-full select-none", className)}
      aria-label="Example product view: verified clinician with complementarity score and recommended engineer match"
    >
      <div className="shadow-match-surface match-surface-panel relative overflow-hidden rounded-2xl border border-white/10 ring-1 ring-white/[0.04] ring-inset">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="pointer-events-none absolute inset-x-6 top-0 h-24 bg-gradient-to-b from-white/[0.03] to-transparent" />

        {/* Zone A — Primary person */}
        <div className="relative h-[272px]">
          <EditorialPortrait
            variant="primary"
            alt="Dr. Ananya Sharma, healthcare professional"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
          <div className="absolute right-0 bottom-0 left-0 px-7 pb-7">
            <h2 className="font-heading text-[1.375rem] leading-[1.15] font-extrabold tracking-[-0.02em] text-white">
              Dr. Ananya Sharma
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CategoryBadge category="healthcare" size="md" />
              <VerifiedBadge size="md" />
            </div>
          </div>
        </div>

        {/* Zone B — Compatibility bridge */}
        <div className="relative border-t border-white/10 px-7 py-6">
          <div
            className="pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
            aria-hidden
          />
          <p className="font-heading text-xs font-bold tracking-[0.2em] text-teal/90 uppercase">
            Complementarity
          </p>
          <div className="mt-2 flex items-baseline gap-0.5">
            <span className="font-heading text-[3rem] leading-none font-black tabular-nums tracking-[-0.03em] text-teal">
              94
            </span>
            <span className="mb-1 font-heading text-xl font-bold text-teal/80">%</span>
          </div>
          <div
            className="mt-3.5 h-1 overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-white/[0.04] ring-inset"
            aria-hidden
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal via-teal/90 to-teal/55"
              style={{ width: "94%" }}
            />
          </div>
        </div>

        {/* Zone C — Complement reveal */}
        <div className="relative border-t border-white/10 bg-white/[0.015] px-6 py-6 sm:px-7">
          <div
            className="pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
            aria-hidden
          />
          <p className="text-xs font-medium tracking-[0.16em] text-white/45 uppercase">
            Recommended complement
          </p>

          <div className="mt-3 flex flex-col gap-3.5 sm:flex-row sm:items-center sm:gap-2 md:gap-3">
            <div className="w-full shrink-0 rounded-[10px] border border-white/[0.07] bg-white/[0.025] p-3.5 sm:w-[128px]">
              <div className="flex items-center gap-2">
                <span className="size-1.5 shrink-0 rounded-full bg-teal/70" aria-hidden />
                <span className="text-xs font-medium tracking-[0.12em] text-white/38 uppercase">
                  Your role
                </span>
              </div>
              <p className="mt-2 text-base font-semibold leading-snug tracking-[-0.01em] text-white/72">
                Clinician
              </p>
            </div>

            <div className="hidden w-10 shrink-0 flex-col items-center justify-center sm:flex sm:w-14" aria-hidden>
              <div className="h-px w-full border-t border-dashed border-white/15" />
              <div className="my-1.5 size-2 rounded-full border border-teal/50 bg-teal/20 shadow-[0_0_8px_rgb(14_124_123/0.25)]" />
            </div>

            <div className="flex items-center gap-2 sm:hidden" aria-hidden>
              <div className="h-4 w-px border-l border-dashed border-white/15" />
              <div className="size-2 rounded-full border border-teal/50 bg-teal/20" />
              <div className="h-4 w-px border-l border-dashed border-white/15" />
            </div>

            <motion.div
              className="relative min-w-0 flex-1 overflow-hidden"
              initial={reducedMotion ? false : { opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { duration: 0.45, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }
              }
            >
              <div className="match-surface-reveal-card flex w-[240px] max-w-none items-center gap-3.5 rounded-xl border border-white/10 bg-ink py-3 pr-4 pl-2.5">
                <div className="overflow-hidden rounded-[10px] ring-1 ring-white/[0.06]">
                  <EditorialPortrait
                    variant="complement"
                    alt="Arjun Mehta, engineer — partial preview"
                  />
                </div>
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-medium tracking-[0.12em] text-white/42 uppercase">
                    Engineer
                  </p>
                  <p className="mt-0.5 truncate text-[15px] font-semibold leading-tight tracking-[-0.01em] text-white/95">
                    Arjun Mehta
                  </p>
                  <p className="mt-1 text-xs font-semibold tabular-nums tracking-wide text-teal/90">
                    91% complement
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <figcaption className="mt-5 text-center text-xs tracking-[0.04em] text-muted-foreground">
        Example product view
      </figcaption>
    </figure>
  );
}
