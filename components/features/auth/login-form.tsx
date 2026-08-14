"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { getSafeCallbackUrl } from "@/lib/auth/callback-url";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { loginSchema } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  async function onSubmit(values: LoginValues) {
    setIsSubmitting(true);
    setError(null);

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      remember: String(values.remember),
      redirect: false,
    });

    if (result?.error) {
      setError(getAuthErrorMessage(result.error, "invalidCredentials"));
      setIsSubmitting(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  const remember = form.watch("remember");

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue building your MedTech co-founder match."
      footer={
        <>
          New here?{" "}
          <Link href={ROUTES.register} className={authLinkClassName}>
            Create an account
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
            <FieldLabel htmlFor="login-email" className={authLabelClassName}>
              Email
            </FieldLabel>
            <Input
              id="login-email"
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
            <div className="flex items-center justify-between gap-3">
              <FieldLabel htmlFor="login-password" className={authLabelClassName}>
                Password
              </FieldLabel>
              <Link
                href="#forgot-password"
                className="text-xs text-muted-foreground transition-colors hover:text-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                aria-disabled="true"
                tabIndex={-1}
                onClick={(event) => event.preventDefault()}
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!form.formState.errors.password}
              className={authFieldClassName}
              {...form.register("password")}
            />
            <FieldError errors={[form.formState.errors.password]} />
          </Field>

          <Field orientation="horizontal">
            <Checkbox
              id="login-remember"
              checked={remember}
              onCheckedChange={(checked) =>
                form.setValue("remember", checked === true, {
                  shouldValidate: true,
                })
              }
              aria-describedby="login-remember-description"
              className="border-border data-checked:border-teal data-checked:bg-teal data-checked:text-ink"
            />
            <FieldContent>
              <FieldLabel
                htmlFor="login-remember"
                className={cn(authLabelClassName, "cursor-pointer font-normal")}
              >
                Remember me
              </FieldLabel>
              <p
                id="login-remember-description"
                className="text-xs text-muted-foreground"
              >
                Stay signed in on this device for 30 days.
              </p>
            </FieldContent>
          </Field>
        </FieldGroup>

        {error ? (
          <p className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          className="h-11 w-full bg-teal text-base font-extrabold text-ink shadow-brutal-teal hover:bg-teal/80 disabled:opacity-60"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Signing in…" : "Log in"}
        </Button>
      </form>
    </AuthShell>
  );
}
