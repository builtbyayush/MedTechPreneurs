import type { ReactNode } from "react";

import Link from "next/link";

import { SplicePlusMark } from "@/components/features/brand/splice-plus-mark";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  list?: string[];
};

type LegalDocumentProps = {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: LegalSection[];
  footer?: ReactNode;
};

export function LegalDocument({
  title,
  subtitle,
  lastUpdated,
  sections,
  footer,
}: LegalDocumentProps) {
  return (
    <main className="min-h-[100svh] bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-10 space-y-4 border-b border-border pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-text dark:text-teal">
            {subtitle}
          </p>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">Last updated {lastUpdated}</p>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            <SplicePlusMark spliceClassName="text-foreground" /> is operated by
            MedTechPreneurs. These documents are starter templates for private
            beta — have counsel review before public launch.
          </p>
        </div>

        <article className="prose-legal space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.list && section.list.length > 0 ? (
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>

        <div className="mt-12 flex flex-wrap gap-3 border-t border-border pt-8">
          <Link
            href={ROUTES.home}
            className={cn(buttonVariants({ variant: "default" }))}
          >
            Back home
          </Link>
          <Link
            href={ROUTES.terms}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Terms
          </Link>
          <Link
            href={ROUTES.privacy}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Privacy
          </Link>
          <Link
            href={ROUTES.cookies}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cookies
          </Link>
        </div>

        {footer}
      </div>
    </main>
  );
}
