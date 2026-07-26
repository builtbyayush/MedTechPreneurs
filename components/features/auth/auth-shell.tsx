import Link from "next/link";
import type { ReactNode } from "react";

import { SplicePlusLogo } from "@/components/features/brand/splice-plus-logo";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function AuthShell({
  title,
  description,
  children,
  footer,
  className,
}: AuthShellProps) {
  return (
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-ink px-5 py-12 sm:px-8">
      <div
        className="landing-noise pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgb(0_204_204/0.12),transparent_60%)]"
        aria-hidden
      />

      <div className={cn("relative z-10 w-full max-w-md", className)}>
        <div className="mb-8 text-center">
          <Link
            href={ROUTES.home}
            className="inline-block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
          >
            <SplicePlusLogo className="text-2xl sm:text-3xl" />
          </Link>
        </div>

        <div className="match-surface-panel rounded-2xl border border-white/10 p-6 shadow-match-surface sm:p-8">
          <header className="mb-8 space-y-2 text-center">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {title}
            </h1>
            <p className="text-sm leading-relaxed text-white/65 sm:text-base">
              {description}
            </p>
          </header>

          {children}
        </div>

        {footer ? (
          <div className="mt-6 text-center text-sm text-white/60">{footer}</div>
        ) : null}
      </div>
    </main>
  );
}

export const authFieldClassName =
  "border-white/15 bg-white/[0.04] text-white placeholder:text-white/35 focus-visible:border-teal focus-visible:ring-teal/30 aria-invalid:border-coral aria-invalid:ring-coral/25";

export const authLabelClassName = "text-white/85";

export const authLinkClassName =
  "font-medium text-teal underline-offset-4 transition-colors hover:text-[#33d6d6] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal";
