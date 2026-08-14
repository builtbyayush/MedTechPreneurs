"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type AppErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppErrorPage({ error, reset }: AppErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
          Something went wrong
        </p>
        <h1 className="font-heading text-2xl font-extrabold text-foreground">
          We hit an unexpected error
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Try again. If the problem continues, check your connection or return
          to Home.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={reset}
          className="bg-teal font-bold text-ink hover:bg-teal/80"
        >
          Try again
        </Button>
        <Link
          href={ROUTES.app.home}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "border-border bg-muted text-foreground hover:bg-muted",
          )}
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
