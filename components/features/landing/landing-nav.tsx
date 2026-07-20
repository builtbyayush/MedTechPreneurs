"use client";

import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { SplicePlusLogo } from "@/components/features/brand/splice-plus-logo";
import {
  LandingCtaLink,
  LandingCtaPrimary,
} from "@/components/features/landing/landing-cta";
import { useScrollY } from "@/hooks/use-scroll-y";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Trust", href: "#trust" },
] as const;

export function LandingNav() {
  const scrolled = useScrollY(80);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-200",
        scrolled
          ? "border-b border-white/10 bg-ink-elevated/90 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.45)] backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-[1200px] items-center justify-between px-5 sm:px-8 lg:px-20">
        <Link
          href="/"
          className="text-xl sm:text-[1.35rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
        >
          <SplicePlusLogo />
        </Link>

        <nav
          className="hidden items-center md:flex md:gap-1"
          aria-label="Main navigation"
        >
          <div className="flex items-center gap-1 pr-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md px-3.5 py-2 text-[13px] font-medium tracking-wide text-white/65 transition-colors hover:bg-white/[0.04] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              >
                {link.label}
              </a>
            ))}
          </div>

          <span className="mx-3 h-5 w-px bg-white/12" aria-hidden />

          <div className="flex items-center gap-5 pl-1">
            <LandingCtaLink
              href="/login"
              className="px-1 text-[13px] text-white/70 hover:text-white"
            >
              Log in
            </LandingCtaLink>
            <LandingCtaPrimary href="/onboarding" size="md">
              Get started
            </LandingCtaPrimary>
          </div>
        </nav>

        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/[0.06] md:hidden"
          aria-expanded={menuOpen}
          aria-controls="landing-mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {menuOpen ? (
        <motion.nav
          id="landing-mobile-menu"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="border-b border-white/10 bg-ink-elevated px-5 py-5 md:hidden"
          aria-label="Mobile navigation"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded-md px-3 py-2.5 text-sm text-white/75 hover:bg-white/[0.04] hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="my-2 h-px bg-white/10" aria-hidden />
            <li>
              <Link
                href="/login"
                className="block rounded-md px-3 py-2.5 text-sm text-white/75 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </Link>
            </li>
            <li className="pt-2">
              <LandingCtaPrimary href="/onboarding" size="md" className="w-full">
                Get started
              </LandingCtaPrimary>
            </li>
          </ul>
        </motion.nav>
      ) : null}
    </header>
  );
}
