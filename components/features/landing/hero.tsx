"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { SplicePlusLogo } from "@/components/features/brand/splice-plus-logo";

type WordTone = "white" | "teal" | "coral";

const HEADLINE_WORDS: { text: string; tone: WordTone; breakAfter?: boolean }[] =
  [
    { text: "Find", tone: "white" },
    { text: "your", tone: "teal" },
    { text: "MedTech", tone: "coral" },
    { text: "co-founder.", tone: "white", breakAfter: true },
    { text: "Swipe.", tone: "teal" },
    { text: "Match.", tone: "coral" },
    { text: "Build", tone: "white" },
    { text: "what", tone: "teal" },
    { text: "clinics", tone: "coral" },
    { text: "actually", tone: "white" },
    { text: "need.", tone: "teal" },
  ];

const toneClass: Record<WordTone, string> = {
  white: "text-white",
  teal: "text-teal",
  coral: "text-coral",
};

function HeadlineWord({
  text,
  tone,
  index,
}: {
  text: string;
  tone: WordTone;
  index: number;
}) {
  return (
    <motion.span
      className={`inline-block cursor-default ${toneClass[tone]}`}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 + index * 0.035, ease: "easeOut" }}
      whileHover={{
        rotate: index % 2 === 0 ? -3.5 : 3.5,
        skewX: index % 2 === 0 ? -4 : 4,
        y: -2,
        transition: { type: "spring", stiffness: 500, damping: 14 },
      }}
    >
      {text}
    </motion.span>
  );
}

export function LandingHero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-5 py-20 sm:px-8 lg:px-12">
      {/* Atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 landing-noise opacity-90"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[min(90vw,52rem)] w-[min(110vw,72rem)] -translate-x-1/2 -translate-y-[45%] rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--color-teal)_28%,transparent)_0%,color-mix(in_srgb,var(--color-coral)_12%,transparent)_38%,transparent_68%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-12%] h-[30rem] w-[30rem] rounded-full bg-coral/12 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-10%] left-[-10%] h-[26rem] w-[26rem] rounded-full bg-teal/18 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-7xl">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="landing-kicker-glow font-heading text-xs font-bold tracking-[0.35em] text-teal uppercase sm:text-sm"
        >
          By MedTechPreneurs
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="mt-5 font-heading text-4xl font-black tracking-tight text-white sm:text-5xl"
        >
          <SplicePlusLogo spliceClassName="text-inherit" className="text-inherit" />
        </motion.p>

        <h1 className="mt-6 max-w-none font-heading text-5xl leading-[0.95] font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          {HEADLINE_WORDS.map((word, index) => (
            <span key={`${word.text}-${index}`}>
              <HeadlineWord text={word.text} tone={word.tone} index={index} />{" "}
              {word.breakAfter ? <br className="hidden sm:block" /> : null}
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.45 }}
          className="mt-8 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg"
        >
          A swipe-based matching platform for Healthcare Professionals,
          Engineers, and Entrepreneurs across Indian healthcare and MedTech —
          so the right teams form before the wrong product gets built.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.52 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <motion.div
            whileHover={{ y: -3 }}
            whileTap={{ y: 2, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
          >
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-coral px-7 font-heading text-sm font-extrabold tracking-wide text-ink shadow-brutal-coral-lg transition-colors hover:bg-[#ff7f72]"
            >
              Get Started
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ y: -3 }}
            whileTap={{ y: 2, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
          >
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-teal bg-ink px-7 font-heading text-sm font-bold tracking-wide text-teal shadow-brutal-teal-lg transition-colors hover:bg-teal hover:text-ink"
            >
              Log In
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
