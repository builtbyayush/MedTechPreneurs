"use client";

import Link from "next/link";

import { SplicePlusLogo } from "@/components/features/brand/splice-plus-logo";
import { SplicePlusMark } from "@/components/features/brand/splice-plus-mark";
import { Reveal } from "@/components/features/landing/reveal";

export function LandingFooter() {
  return (
    <footer className="relative border-t border-white/10 px-6 py-16 sm:px-10 sm:py-20">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <Reveal>
          <p className="font-heading text-2xl font-black text-white">
            <SplicePlusLogo spliceClassName="text-inherit" className="text-inherit" />
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
            <SplicePlusMark /> is part of the{" "}
            <a
              href="https://medtechpreneurs.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-teal underline-offset-4 hover:underline"
            >
              MedTechPreneurs
            </a>{" "}
            ecosystem — the always-on, mobile-native way to find co-founders in
            Indian healthcare and MedTech.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link
              href="/register"
              className="font-heading font-bold text-coral hover:underline"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="font-heading font-bold text-white/80 hover:text-white hover:underline"
            >
              Log In
            </Link>
            <a
              href="https://medtechpreneurs.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-heading font-bold text-white/80 hover:text-teal hover:underline"
            >
              medtechpreneurs.com
            </a>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
