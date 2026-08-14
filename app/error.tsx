"use client";

import { useEffect } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 bg-background px-4 py-16 text-center">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-text dark:text-teal">
          Something went wrong
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          We hit an unexpected error
        </h1>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Try again. If the problem continues, return home — that clears a stuck
          session so you are not looped back into the error.
        </p>
        {error.digest ? (
          <p className="text-[11px] text-muted-foreground/80">
            Ref: {error.digest}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <a
          href={`${ROUTES.logout}?to=${encodeURIComponent(ROUTES.home)}`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Back home
        </a>
      </div>
    </main>
  );
}
