"use client";

import { useEffect } from "react";

import Link from "next/link";

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
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 bg-bg-light px-4 py-16 text-center">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
          Something went wrong
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-deep-blue">
          We hit an unexpected error
        </h1>
        <p className="mx-auto max-w-md text-sm text-deep-blue/70">
          Try again. If the problem continues, check your connection, clear site
          data if assets look stale, or return home.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link
          href={ROUTES.home}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
