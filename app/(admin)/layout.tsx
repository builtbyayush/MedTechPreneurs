import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/features/theme/theme-toggle";
import { auth } from "@/auth";
import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/lib/auth/account";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();

  try {
    await requireAdmin(session?.user?.id);
  } catch {
    redirect(ROUTES.app.home);
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border bg-card/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-teal-text uppercase dark:text-teal">
              Admin
            </p>
            <h1 className="font-heading text-lg font-extrabold text-foreground">
              Moderation
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href={ROUTES.app.settings}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Back to Settings
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
