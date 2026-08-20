"use client";

import Link from "next/link";

import { EmailVerifiedBadge } from "@/components/features/founder/verified-badge";
import { ROUTES } from "@/constants/routes";

type EmailVerificationRowProps = {
  email: string;
  emailVerified: boolean;
};

export function EmailVerificationRow({
  email,
  emailVerified,
}: EmailVerificationRowProps) {
  return (
    <div className="rounded-xl border border-border bg-muted/60 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">Email address</p>
          <p className="mt-1 text-sm text-muted-foreground">{email}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {emailVerified
              ? "Your email is verified. This is your current trust signal on Splice."
              : "Verify your email to unlock the full app experience."}
          </p>
        </div>
        {emailVerified ? (
          <EmailVerifiedBadge size="md" />
        ) : (
          <Link
            href={ROUTES.onboarding}
            className="text-sm font-semibold text-teal hover:underline"
          >
            Verify email
          </Link>
        )}
      </div>
    </div>
  );
}
