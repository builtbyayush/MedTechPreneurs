"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { AUTH_ERROR_MESSAGES, getAuthErrorMessage } from "@/lib/auth/errors";
import { registerSchema } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const acceptTerms = form.watch("acceptTerms") === true;

  async function onSubmit(values: RegisterValues) {
    setIsSubmitting(true);
    setError(null);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = (await response.json().catch(() => null)) as {
      error?: string;
      message?: string;
    } | null;

    if (!response.ok) {
      setError(
        payload?.error ??
          payload?.message ??
          AUTH_ERROR_MESSAGES.registrationFailed,
      );
      setIsSubmitting(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email: values.email,
      password: values.password,
      remember: "true",
      redirect: false,
    });

    if (signInResult?.error) {
      setError(getAuthErrorMessage(signInResult.error, "signInFailed"));
      setIsSubmitting(false);
      return;
    }

    router.push(ROUTES.onboarding);
    router.refresh();
  }

  return (
    <AuthShell
      title="Create your account"
      description="Join Splice+ to find the co-founder your MedTech idea is missing."
      footer={
        <>
          Already have an account?{" "}
          <Link href={ROUTES.login} className={authLinkClassName}>
            Log in
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
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="register-name" className={authLabelClassName}>
              Full name
            </FieldLabel>
            <Input
              id="register-name"
              type="text"
              autoComplete="name"
              aria-invalid={!!form.formState.errors.name}
              className={authFieldClassName}
              {...form.register("name")}
            />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>

          <Field data-invalid={!!form.formState.errors.email}>
            <FieldLabel htmlFor="register-email" className={authLabelClassName}>
              Email
            </FieldLabel>
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              aria-invalid={!!form.formState.errors.email}
              className={authFieldClassName}
              {...form.register("email")}
            />
            <FieldError errors={[form.formState.errors.email]} />
          </Field>

          <Field data-invalid={!!form.formState.errors.password}>
            <FieldLabel
              htmlFor="register-password"
              className={authLabelClassName}
            >
              Password
            </FieldLabel>
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!form.formState.errors.password}
              className={authFieldClassName}
              {...form.register("password")}
            />
            <FieldError errors={[form.formState.errors.password]} />
          </Field>

          <Field data-invalid={!!form.formState.errors.confirmPassword}>
            <FieldLabel
              htmlFor="register-confirm-password"
              className={authLabelClassName}
            >
              Confirm password
            </FieldLabel>
            <Input
              id="register-confirm-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!form.formState.errors.confirmPassword}
              className={authFieldClassName}
              {...form.register("confirmPassword")}
            />
            <FieldError errors={[form.formState.errors.confirmPassword]} />
          </Field>

          <Field data-invalid={!!form.formState.errors.acceptTerms}>
            <div className="flex items-start gap-3">
              <Checkbox
                id="register-terms"
                checked={acceptTerms}
                onCheckedChange={(checked) =>
                  form.setValue("acceptTerms", checked === true, {
                    shouldValidate: true,
                  })
                }
                aria-invalid={!!form.formState.errors.acceptTerms}
                className="mt-0.5 border-white/20 data-checked:border-teal data-checked:bg-teal data-checked:text-ink"
              />
              <FieldContent>
                <FieldLabel
                  htmlFor="register-terms"
                  className={cn(
                    authLabelClassName,
                    "cursor-pointer text-sm leading-relaxed font-normal",
                  )}
                >
                  I accept the{" "}
                  <Link href="/terms" className={authLinkClassName}>
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className={authLinkClassName}>
                    Privacy Policy
                  </Link>
                </FieldLabel>
                <FieldError errors={[form.formState.errors.acceptTerms]} />
              </FieldContent>
            </div>
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
          className="h-11 w-full bg-teal text-base font-extrabold text-ink shadow-brutal-teal hover:bg-[#33d6d6] disabled:opacity-60"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
