"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { OnboardingProgress } from "@/components/features/onboarding/onboarding-progress";
import { SplicePlusLogo } from "@/components/features/brand/splice-plus-logo";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type OnboardingShellProps = {
  step: number;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function OnboardingShell({
  step,
  children,
  footer,
  className,
}: OnboardingShellProps) {
  return (
    <main className="relative flex min-h-[100svh] flex-col bg-ink">
      <div
        className="landing-noise pointer-events-none absolute inset-0 opacity-25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-20%,rgb(0_204_204/0.14),transparent_62%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-lg flex-col border-x border-white/[0.06] px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6">
        <div className="mb-8 flex items-center justify-between gap-4">
          <SplicePlusLogo className="text-xl sm:text-2xl" />
          <Link
            href={ROUTES.logout}
            className="rounded-md px-2 py-1.5 text-sm font-medium text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            Log out
          </Link>
        </div>

        <OnboardingProgress step={step} className="mb-8" />

        <div className={cn("flex flex-1 flex-col", className)}>{children}</div>

        {footer ? (
          <div className="mt-8 border-t border-white/10 pt-5">{footer}</div>
        ) : null}
      </div>
    </main>
  );
}
