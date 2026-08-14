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
import { ThemeToggle } from "@/components/features/theme/theme-toggle";
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
          ? "border-b border-border bg-background/90 shadow-[0_8px_24px_-12px_rgb(15_42_71/0.12)] backdrop-blur-md dark:border-border dark:bg-card/90 dark:shadow-[0_8px_24px_-12px_rgb(0_0_0/0.45)]"
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
                className="rounded-md px-3.5 py-2 text-[13px] font-medium tracking-wide text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              >
                {link.label}
              </a>
            ))}
          </div>

          <span className="mx-3 h-5 w-px bg-border" aria-hidden />

          <div className="flex items-center gap-3 pl-1">
            <ThemeToggle />
            <LandingCtaLink
              href="/login"
              className="px-1 text-[13px] text-muted-foreground hover:text-foreground"
            >
              Log in
            </LandingCtaLink>
            <LandingCtaPrimary href="/register" size="md">
              Get started
            </LandingCtaPrimary>
          </div>
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <motion.nav
          id="landing-mobile-menu"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="border-b border-border bg-card px-5 py-5 md:hidden"
          aria-label="Mobile navigation"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded-md px-3 py-2.5 text-base text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="my-2 h-px bg-border" aria-hidden />
            <li>
              <Link
                href="/login"
                className="block rounded-md px-3 py-2.5 text-base text-muted-foreground hover:text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </Link>
            </li>
            <li className="pt-2">
              <LandingCtaPrimary href="/register" size="md" className="w-full">
                Get started
              </LandingCtaPrimary>
            </li>
          </ul>
        </motion.nav>
      ) : null}
    </header>
  );
}
