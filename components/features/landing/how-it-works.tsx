"use client";

import type { ReactNode } from "react";

import { SplicePlusMark } from "@/components/features/brand/splice-plus-mark";
import { Reveal } from "@/components/features/landing/reveal";

const STEPS: {
  step: string;
  title: string;
  body: ReactNode;
}[] = [
  {
    step: "01",
    title: "Pick what defines you",
    body: "Choose one category: Healthcare Professional, Engineer, or Entrepreneur. That choice shapes who you can discover.",
  },
  {
    step: "02",
    title: "Say who you're looking for",
    body: (
      <>
        Select the complementary categories you need on your team — never your own by default.{" "}
        <SplicePlusMark /> is built for co-founding, not networking clones.
      </>
    ),
  },
  {
    step: "03",
    title: "Get matched",
    body: "Swipe through Founder Cards ranked by complementarity — skills, vision, and location — not generic LinkedIn noise.",
  },
  {
    step: "04",
    title: "Connect & build",
    body: "Like, send one intentional intro, then unlock full chat when they Connect. From there: build the product clinics actually need.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative border-y border-border bg-deep-blue/40 px-6 py-20 sm:px-10 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="font-heading text-xs font-bold tracking-[0.2em] text-teal uppercase">
            How it works
          </p>
          <h2 className="mt-3 font-heading text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            From sign-up to co-founder in four moves.
          </h2>
        </Reveal>

        <ol className="mt-12 grid gap-6 sm:grid-cols-2">
          {STEPS.map((item, index) => (
            <Reveal key={item.step} delay={index * 0.07}>
              <li className="flex h-full flex-col rounded-lg border border-border bg-background p-6 shadow-brutal-coral">
                <span className="font-heading text-sm font-black text-coral">
                  {item.step}
                </span>
                <h3 className="mt-2 font-heading text-xl font-extrabold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
