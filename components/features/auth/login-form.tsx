"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
import { PasswordInput } from "@/components/ui/password-input";
import { ROUTES } from "@/constants/routes";
import { getSafeCallbackUrl } from "@/lib/auth/callback-url";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { getLoginNoticeMessage } from "@/lib/auth/login-url";
import { loginSchema } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

type LoginValues = z.infer<typeof loginSchema>;

/** Auth.js-owned error codes — leave these alone if present. */
const AUTHJS_ERROR_CODES = new Set([
  "Configuration",
  "AccessDenied",
  "Verification",
  "OAuthSignin",
  "OAuthCallback",
  "OAuthCreateAccount",
  "EmailCreateAccount",
  "Callback",
  "OAuthAccountNotLinked",
  "EmailSignin",
  "CredentialsSignin",
  "SessionRequired",
  "Default",
]);

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));
  const notice = searchParams.get("notice");
  const legacyError = searchParams.get("error");

  const [noticeMessage, setNoticeMessage] = useState<string | null>(() =>
    getLoginNoticeMessage(notice),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Strip product `error=` values Auth.js would misread (e.g. stale_session).
  // Keep real Auth.js codes. Prefer `notice=` for product messaging.
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    let changed = false;

    const errorParam = url.searchParams.get("error");
    if (errorParam && !AUTHJS_ERROR_CODES.has(errorParam)) {
      // Migrate known legacy recovery params into notice messaging.
      if (
        errorParam === "stale_session" ||
        errorParam === "session_recovery"
      ) {
        setNoticeMessage(getLoginNoticeMessage("session_expired"));
      } else if (errorParam === "account_restricted") {
        setNoticeMessage(getLoginNoticeMessage("account_restricted"));
      }
      url.searchParams.delete("error");
      changed = true;
    }

    if (changed) {
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [legacyError]);

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
    setNoticeMessage(null);

    try {
      const result = await signIn("credentials", {
        email: values.email.trim().toLowerCase(),
        password: values.password,
        remember: String(values.remember),
        redirect: false,
      });

      if (result?.error) {
        setError(getAuthErrorMessage(result.error, "invalidCredentials"));
        setIsSubmitting(false);
        return;
      }

      // Hard navigation so the new session cookie is applied cleanly.
      window.location.assign(callbackUrl);
    } catch (err) {
      console.error("[login] signIn failed", err);
      setError(
        "Sign-in failed due to a browser/network issue. Please try again.",
      );
      setIsSubmitting(false);
    }
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
                href={ROUTES.forgotPassword}
                className="text-xs text-muted-foreground transition-colors hover:text-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="login-password"
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

        {noticeMessage ? (
          <p
            className="rounded-lg border border-teal/25 bg-teal/10 px-3 py-2 text-sm text-teal-text dark:text-teal"
            role="status"
          >
            {noticeMessage}
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
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Signing in…" : "Log in"}
        </Button>
      </form>
    </AuthShell>
  );
}
