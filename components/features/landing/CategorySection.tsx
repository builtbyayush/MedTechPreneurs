"use client";

import { motion } from "framer-motion";
import { Code2, Rocket, Stethoscope, type LucideIcon } from "lucide-react";

type AccentKey = "teal" | "coral" | "blue";

type Category = {
  label: string;
  title: string;
  body: string;
  roles: string[];
  accent: AccentKey;
  Icon: LucideIcon;
};

const CATEGORIES: Category[] = [
  {
    label: "Community",
    title: "Healthcare Professionals",
    body: "Clinical insight at the point of care — the people who know which problems are real.",
    roles: [
      "Doctors",
      "Medical Students",
      "Dentists",
      "Pharmacists",
      "Nutritionists",
      "Technicians",
      "Nurses",
      "Medical Content Creators",
    ],
    accent: "teal",
    Icon: Stethoscope,
  },
  {
    label: "Community",
    title: "Engineers",
    body: "Builders who turn validated clinical problems into software, AI, and MedTech products.",
    roles: ["AI/ML Experts", "Software Developers", "Software Engineers"],
    accent: "coral",
    Icon: Code2,
  },
  {
    label: "Community",
    title: "Entrepreneurs",
    body: "Founders and capital partners who assemble complementary teams and ship investable companies.",
    roles: ["Founders", "Investors", "Co-Founders"],
    accent: "blue",
    Icon: Rocket,
  },
];

const HEADING_WORDS: { text: string; tone: "white" | "teal" | "coral" }[] = [
  { text: "Three", tone: "white" },
  { text: "Communities.", tone: "teal" },
  { text: "One", tone: "coral" },
  { text: "Platform.", tone: "white" },
];

const accentStyles: Record<
  AccentKey,
  {
    text: string;
    border: string;
    iconWrap: string;
    dot: string;
  }
> = {
  teal: {
    text: "text-teal",
    border: "border-teal",
    iconWrap: "bg-teal/15 text-teal",
    dot: "bg-teal",
  },
  coral: {
    text: "text-coral",
    border: "border-coral",
    iconWrap: "bg-coral/15 text-coral",
    dot: "bg-coral",
  },
  // Light tint of deep-blue so it reads on dark navy (not the literal token)
  blue: {
    text: "text-deep-blue-soft",
    border: "border-deep-blue-soft",
    iconWrap: "bg-deep-blue-soft/15 text-deep-blue-soft",
    dot: "bg-deep-blue-soft",
  },
};

const toneClass = {
  white: "text-foreground",
  teal: "text-teal",
  coral: "text-coral",
} as const;

export function CategorySection() {
  return (
    <section className="relative px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          className="max-w-4xl font-heading text-3xl leading-tight font-black tracking-tight sm:text-4xl md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          {HEADING_WORDS.map((word, index) => (
            <span key={`${word.text}-${index}`}>
              <span className={toneClass[word.tone]}>{word.text}</span>
              {index < HEADING_WORDS.length - 1 ? " " : null}
            </span>
          ))}
        </motion.h2>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Every user picks one category at sign-up — then discovers people from
          the others. Complementary teams, not lookalike networks.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {CATEGORIES.map((category, index) => {
            const styles = accentStyles[category.accent];
            const Icon = category.Icon;

            return (
              <motion.article
                key={category.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.45,
                  ease: "easeOut",
                  delay: index * 0.12,
                }}
                className={`flex h-full flex-col rounded-lg border-2 bg-card p-6 ${styles.border}`}
              >
                <div
                  className={`mb-4 flex size-11 items-center justify-center rounded-lg ${styles.iconWrap}`}
                >
                  <Icon className="size-5" aria-hidden />
                </div>

                <p
                  className={`font-heading text-[11px] font-bold tracking-[0.22em] uppercase ${styles.text}`}
                >
                  {category.label}
                </p>

                <h3 className="mt-2 font-heading text-xl font-extrabold text-foreground sm:text-2xl">
                  {category.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {category.body}
                </p>

                <ul className="mt-5 flex flex-col gap-2">
                  {category.roles.map((role) => (
                    <li
                      key={role}
                      className="flex items-start gap-2.5 text-sm text-foreground/85"
                    >
                      <span
                        className={`mt-1.5 size-1.5 shrink-0 rounded-full ${styles.dot}`}
                        aria-hidden
                      />
                      {role}
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
