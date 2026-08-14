"use client";

import { SplicePlusMark } from "@/components/features/brand/splice-plus-mark";
import { Reveal } from "@/components/features/landing/reveal";

const PROBLEMS = [
  {
    label: "Engineers",
    title: "Building the wrong thing",
    body: "Without a doctor validating the problem at the point of care, teams often ship solutions that were never the real clinical pain.",
    shadow: "shadow-brutal-teal",
  },
  {
    label: "Doctors",
    title: "No route to technical talent",
    body: "Healthcare professionals hold the deepest clinical insight — and no structured way to reach engineers who could build with them.",
    shadow: "shadow-brutal-coral",
  },
  {
    label: "Investors",
    title: "Can't find investable teams",
    body: "Capital is ready for healthcare innovation, but founding teams were never properly matched — so investable products stay rare.",
    shadow: "shadow-brutal-teal-lg",
  },
] as const;

export function ProblemSection() {
  return (
    <section className="relative px-6 py-20 sm:px-10 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="font-heading text-xs font-bold tracking-[0.2em] text-teal uppercase">
            Why <SplicePlusMark />
          </p>
          <h2 className="mt-3 max-w-3xl font-heading text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Three groups. One isolation problem.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Across India&apos;s healthcare and MedTech ecosystem, these three
            communities sit apart — and that gap is where products fail and good
            ideas go unfunded.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PROBLEMS.map((item, index) => (
            <Reveal key={item.label} delay={index * 0.08}>
              <article
                className={`flex h-full flex-col rounded-lg border border-border bg-card p-6 ${item.shadow}`}
              >
                <p className="font-heading text-xs font-bold tracking-[0.18em] text-coral uppercase">
                  {item.label}
                </p>
                <h3 className="mt-3 font-heading text-xl font-extrabold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
