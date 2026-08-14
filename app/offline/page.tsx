import Link from "next/link";

import { SplicePlusMark } from "@/components/features/brand/splice-plus-mark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

export const metadata = {
  title: "Offline | Splice+",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 bg-background px-4 py-16 text-center">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-text dark:text-teal">
          Offline
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          You are offline
        </h1>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          <SplicePlusMark spliceClassName="text-foreground" /> needs an internet
          connection for matching and messaging. Reconnect, then try again.
        </p>
      </div>

      <Link
        href={ROUTES.home}
        className={cn(buttonVariants({ variant: "default" }))}
      >
        Retry
      </Link>
    </main>
  );
}
