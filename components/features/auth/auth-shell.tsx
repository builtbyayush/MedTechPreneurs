import Link from "next/link";
import type { ReactNode } from "react";

import { SplicePlusLogo } from "@/components/features/brand/splice-plus-logo";
import { ThemeToggle } from "@/components/features/theme/theme-toggle";
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
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-background px-5 py-12 sm:px-8">
      <div
        className="landing-noise pointer-events-none absolute inset-0 opacity-40 dark:opacity-30"
        aria-hidden
      />
      <div
        className="landing-hero-wash pointer-events-none absolute inset-0"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgb(0_204_204/0.12),transparent_60%)] dark:block"
        aria-hidden
      />

      <div className="absolute top-4 right-4 z-20 sm:top-6 sm:right-6">
        <ThemeToggle size="md" />
      </div>

      <div className={cn("relative z-10 w-full max-w-md", className)}>
        <div className="mb-8 text-center">
          <Link
            href={ROUTES.home}
            className="inline-block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
          >
            <SplicePlusLogo className="text-2xl sm:text-3xl" />
          </Link>
        </div>

        <div className="founder-card-glass rounded-2xl border border-border p-6 shadow-founder-card sm:p-8">
          <header className="mb-8 space-y-2 text-center">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {description}
            </p>
          </header>

          {children}
        </div>

        {footer ? (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </div>
    </main>
  );
}

export const authFieldClassName =
  "auth-field border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:border-teal focus-visible:ring-teal/30 aria-invalid:border-coral aria-invalid:ring-coral/25";

export const authLabelClassName = "text-foreground/85";

export const authLinkClassName =
  "font-medium text-teal-text underline-offset-4 transition-colors hover:text-teal hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal dark:text-teal dark:hover:text-teal/80";
