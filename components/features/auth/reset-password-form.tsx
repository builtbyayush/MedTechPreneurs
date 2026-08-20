"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import {
  AuthShell,
  authFieldClassName,
  authLabelClassName,
  authLinkClassName,
} from "@/components/features/auth/auth-shell";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { ROUTES } from "@/constants/routes";
import { PASSWORD_RESET_MESSAGES } from "@/config/password-reset";
import { resetPasswordSchema } from "@/lib/validations/password-reset";

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

type TokenState =
  | { status: "loading" }
  | { status: "valid"; token: string }
  | { status: "invalid"; reason: "invalid" | "expired" | "used" | "missing" }
  | { status: "success" };

function ResetPasswordFormInner() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [tokenState, setTokenState] = useState<TokenState>({
    status: "loading",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: tokenFromUrl,
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function validateToken() {
      if (!tokenFromUrl.trim()) {
        setTokenState({ status: "invalid", reason: "missing" });
        return;
      }

      try {
        const response = await fetch(
          `/api/auth/reset-password?token=${encodeURIComponent(tokenFromUrl)}`,
        );
        const payload = (await response.json()) as {
          valid?: boolean;
          reason?: "invalid" | "expired" | "used";
        };

        if (cancelled) {
          return;
        }

        if (payload.valid) {
          setTokenState({ status: "valid", token: tokenFromUrl });
          return;
        }

        setTokenState({
          status: "invalid",
          reason: payload.reason ?? "invalid",
        });
      } catch (err) {
        console.error("[reset-password] token validation failed", err);
        if (!cancelled) {
          setTokenState({ status: "invalid", reason: "invalid" });
        }
      }
    }

    void validateToken();

    return () => {
      cancelled = true;
    };
  }, [tokenFromUrl]);

  async function onSubmit(values: ResetPasswordValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.message ?? PASSWORD_RESET_MESSAGES.resetFailed);
        setIsSubmitting(false);
        return;
      }

      setTokenState({ status: "success" });
    } catch (err) {
      console.error("[reset-password]", err);
      setError(PASSWORD_RESET_MESSAGES.resetFailed);
      setIsSubmitting(false);
    }
  }

  if (tokenState.status === "loading") {
    return (
      <AuthShell
        title="Reset your password"
        description="Checking your reset link…"
      >
        <div className="flex justify-center py-8">
          <div
            className="size-10 animate-spin rounded-full border-2 border-teal/20 border-t-teal"
            aria-label="Loading"
          />
        </div>
      </AuthShell>
    );
  }

  if (tokenState.status === "invalid") {
    return (
      <AuthShell
        title="Reset link unavailable"
        description={PASSWORD_RESET_MESSAGES.invalidToken}
        footer={
          <>
            <Link href={ROUTES.forgotPassword} className={authLinkClassName}>
              Request a new reset link
            </Link>
            {" · "}
            <Link href={ROUTES.login} className={authLinkClassName}>
              Back to sign in
            </Link>
          </>
        }
      >
        <p
          className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral"
          role="alert"
        >
          {PASSWORD_RESET_MESSAGES.invalidToken}
        </p>
      </AuthShell>
    );
  }

  if (tokenState.status === "success") {
    return (
      <AuthShell
        title="Password updated"
        description={PASSWORD_RESET_MESSAGES.resetSuccess}
        footer={
          <Link href={ROUTES.login} className={authLinkClassName}>
            Continue to sign in
          </Link>
        }
      >
        <p
          className="rounded-lg border border-teal/25 bg-teal/10 px-3 py-2 text-sm text-teal-text dark:text-teal"
          role="status"
        >
          {PASSWORD_RESET_MESSAGES.resetSuccess}
        </p>
        <Link
          href={ROUTES.login}
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-teal text-base font-extrabold text-ink shadow-brutal-teal transition-colors hover:bg-teal/80"
        >
          Go to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Choose a new password"
      description="Use at least 8 characters. You'll sign in with this password next time."
      footer={
        <>
          <Link href={ROUTES.login} className={authLinkClassName}>
            Back to sign in
          </Link>
        </>
      }
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        <input type="hidden" {...form.register("token")} />

        <FieldGroup>
          <Field data-invalid={!!form.formState.errors.password}>
            <FieldLabel
              htmlFor="reset-password"
              className={authLabelClassName}
            >
              New password
            </FieldLabel>
            <PasswordInput
              id="reset-password"
              autoComplete="new-password"
              aria-invalid={!!form.formState.errors.password}
              className={authFieldClassName}
              {...form.register("password")}
            />
            <FieldError errors={[form.formState.errors.password]} />
          </Field>

          <Field data-invalid={!!form.formState.errors.confirmPassword}>
            <FieldLabel
              htmlFor="reset-confirm-password"
              className={authLabelClassName}
            >
              Confirm new password
            </FieldLabel>
            <PasswordInput
              id="reset-confirm-password"
              autoComplete="new-password"
              aria-invalid={!!form.formState.errors.confirmPassword}
              className={authFieldClassName}
              {...form.register("confirmPassword")}
            />
            <FieldError errors={[form.formState.errors.confirmPassword]} />
          </Field>
        </FieldGroup>

        {error ? (
          <p
            className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          className="h-11 w-full bg-teal text-base font-extrabold text-ink shadow-brutal-teal hover:bg-teal/80 disabled:opacity-60"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}

function ResetPasswordFallback() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-background">
      <div
        className="size-10 animate-spin rounded-full border-2 border-teal/20 border-t-teal"
        aria-label="Loading reset password"
      />
    </main>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordFormInner />
    </Suspense>
  );
}
