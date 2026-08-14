"use client";

import { useEffect } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type AppErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * App-shell errors often include /home itself. Soft Links to /home (or / while
 * logged in — middleware bounces back to /home) cannot recover. Use hard
 * navigations: retry in-place, or sign out to a public page.
 */
export default function AppErrorPage({ error, reset }: AppErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-text dark:text-teal">
          Something went wrong
        </p>
        <h1 className="font-heading text-2xl font-extrabold text-foreground">
          We hit an unexpected error
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Try again. If the problem continues, return to the landing page — that
          signs you out so you are not stuck on this screen.
        </p>
        {error.digest ? (
          <p className="text-[11px] text-muted-foreground/80">
            Ref: {error.digest}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={reset}
          className="bg-teal font-bold text-ink hover:bg-teal/80"
        >
          Try again
        </Button>
        <a
          href={`${ROUTES.logout}?to=${encodeURIComponent(ROUTES.home)}`}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "border-border bg-muted text-foreground hover:bg-muted",
          )}
        >
          Back home
        </a>
      </div>
    </main>
  );
}
