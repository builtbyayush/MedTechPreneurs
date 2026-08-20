"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { forgotPasswordSchema } from "@/lib/validations/password-reset";

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
        devResetUrl?: string;
      } | null;

      if (response.status === 429) {
        setError(payload?.message ?? "Please wait before requesting another link.");
        setIsSubmitting(false);
        return;
      }

      if (!response.ok && response.status !== 500) {
        setError(payload?.message ?? "Enter a valid email address.");
        setIsSubmitting(false);
        return;
      }

      setSubmitted(true);
      setMessage(
        payload?.message ??
          "If an account exists for this email, you'll receive instructions to reset your password.",
      );

      if (process.env.NODE_ENV !== "production" && payload?.devResetUrl) {
        setMessage(
          `${payload.message ?? "Reset link generated (dev mode)."} Open: ${payload.devResetUrl}`,
        );
      }
    } catch (err) {
      console.error("[forgot-password]", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      description="Enter the email you used to sign up. We'll send reset instructions if an account exists."
      footer={
        <>
          Remember your password?{" "}
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
        <FieldGroup>
          <Field data-invalid={!!form.formState.errors.email}>
            <FieldLabel
              htmlFor="forgot-password-email"
              className={authLabelClassName}
            >
              Email
            </FieldLabel>
            <Input
              id="forgot-password-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              disabled={submitted}
              aria-invalid={!!form.formState.errors.email}
              className={authFieldClassName}
              {...form.register("email")}
            />
            <FieldError errors={[form.formState.errors.email]} />
          </Field>
        </FieldGroup>

        {message ? (
          <p
            className="rounded-lg border border-teal/25 bg-teal/10 px-3 py-2 text-sm text-teal-text dark:text-teal"
            role="status"
          >
            {message}
          </p>
        ) : null}

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
          disabled={isSubmitting || submitted}
          aria-busy={isSubmitting}
        >
          {isSubmitting
            ? "Sending…"
            : submitted
              ? "Email sent"
              : "Send reset link"}
        </Button>

        <div className="text-center">
          <Link href={ROUTES.login} className={authLinkClassName}>
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
