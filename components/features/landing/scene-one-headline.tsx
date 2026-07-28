"use client";

import { motion } from "framer-motion";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type WordTone = "white" | "teal" | "accent" | "highlight";

type HeadlineWordDef = {
  text: string;
  tone: WordTone;
  breakAfter?: boolean;
};

const HEADLINE_WORDS: HeadlineWordDef[] = [
  { text: "Find", tone: "white" },
  { text: "co-founders,", tone: "teal" },
  { text: "partners,", tone: "accent" },
  { text: "mentors", tone: "teal", breakAfter: true },
  { text: "Investors,", tone: "accent", breakAfter: true },
  { text: "&", tone: "white" },
  { text: "grab", tone: "highlight" },
  { text: "funding", tone: "highlight" },
];

const toneClass: Record<WordTone, string> = {
  white: "text-white",
  teal: "text-teal",
  accent: "text-[#c084fc]",
  highlight: "text-[#fde047]",
};

function HeadlineWord({
  text,
  tone,
  index,
  reducedMotion,
}: {
  text: string;
  tone: WordTone;
  index: number;
  reducedMotion: boolean;
}) {
  const wiggleRight = index % 2 === 0;

  return (
    <motion.span
      className={`relative inline-block cursor-pointer will-change-transform ${toneClass[tone]}`}
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: 0.08 + index * 0.04,
        ease: "easeOut",
      }}
      whileHover={
        reducedMotion
          ? undefined
          : {
              scale: 1.22,
              y: -4,
              rotate: wiggleRight ? [0, -6, 6, -4, 4, 0] : [0, 6, -6, 4, -4, 0],
              skewX: wiggleRight ? [0, -4, 4, -2, 2, 0] : [0, 4, -4, 2, -2, 0],
              zIndex: 20,
              transition: { duration: 0.42, ease: "easeInOut" },
            }
      }
    >
      {text}
    </motion.span>
  );
}

export function SceneOneHeadline({ id }: { id: string }) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <h1
      id={id}
      className="mt-8 font-heading text-[9vw] font-black uppercase leading-[0.9] tracking-tighter sm:mt-10 sm:text-4xl md:text-5xl lg:text-[2.75rem] xl:text-6xl 2xl:text-7xl"
      style={{ perspective: 1000 }}
    >
      {HEADLINE_WORDS.map((word, index) => (
        <span key={`${word.text}-${index}`}>
          <HeadlineWord
            text={word.text}
            tone={word.tone}
            index={index}
            reducedMotion={reducedMotion}
          />{" "}
          {word.breakAfter ? <br /> : null}
        </span>
      ))}
    </h1>
  );
}
