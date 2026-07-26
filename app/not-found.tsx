import Link from "next/link";

import { SplicePlusMark } from "@/components/features/brand/splice-plus-mark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 bg-bg-light px-4 py-16 text-center">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
          404
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-deep-blue">
          Page not found
        </h1>
        <p className="mx-auto max-w-md text-sm text-deep-blue/70">
          The page you are looking for does not exist or may have moved. Head
          back to <SplicePlusMark spliceClassName="text-deep-blue" /> to
          continue.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={ROUTES.home}
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Back home
        </Link>
        <Link
          href={ROUTES.app.home}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          App home
        </Link>
      </div>
      <p className="text-xs text-deep-blue/50">
        <Link href={ROUTES.terms} className="hover:text-teal">
          Terms
        </Link>
        {" · "}
        <Link href={ROUTES.privacy} className="hover:text-teal">
          Privacy
        </Link>
      </p>
    </main>
  );
}
