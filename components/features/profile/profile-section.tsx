import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ProfileSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function ProfileSection({
  title,
  description,
  children,
  className,
}: ProfileSectionProps) {
  return (
    <section
      className={cn(
        "founder-card-glass rounded-2xl border border-border p-5 shadow-founder-card sm:p-6",
        className,
      )}
    >
      <header className="mb-4 space-y-1">
        <h2 className="font-heading text-base font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
