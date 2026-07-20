"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { springPress } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type LandingCtaProps = {
  href: string;
  children: React.ReactNode;
  size?: "md" | "lg";
  className?: string;
};

export function LandingCtaPrimary({
  href,
  children,
  size = "lg",
  className,
}: LandingCtaProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      className={cn(className?.includes("w-full") && "w-full sm:w-auto")}
      whileHover={reducedMotion ? undefined : { y: -2 }}
      whileTap={reducedMotion ? undefined : { y: 2, scale: 0.98 }}
      transition={springPress}
    >
      <Link
        href={href}
        className={cn(
          "inline-flex w-full items-center justify-center rounded-lg bg-teal font-heading text-sm font-extrabold tracking-wide text-ink transition-colors hover:bg-[#33d6d6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal sm:w-auto",
          size === "lg" && "h-12 px-7 shadow-brutal-teal sm:shadow-brutal-teal-lg",
          size === "md" && "h-10 px-5 shadow-brutal-teal",
          className
        )}
      >
        {children}
      </Link>
    </motion.div>
  );
}

type LandingCtaLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function LandingCtaLink({ href, children, className }: LandingCtaLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium text-white/80 underline-offset-4 transition-colors hover:text-teal hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal",
        className
      )}
    >
      {children}
    </Link>
  );
}
