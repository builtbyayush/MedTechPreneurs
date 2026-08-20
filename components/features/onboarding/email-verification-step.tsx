"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

import {
  authFieldClassName,
  authLabelClassName,
} from "@/components/features/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EMAIL_VERIFICATION } from "@/config/email";
import { ROUTES } from "@/constants/routes";

const SESSION_EXPIRED_MESSAGE =
  "Your session expired. Please sign in again to verify your email.";

type EmailVerificationStepProps = {
  accountEmail?: string;
  onVerifiedChange: (verified: boolean) => void;
  onError: (message: string | null) => void;
};

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) {
    return email;
  }

  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(local.length - visible.length, 2))}@${domain}`;
}

function handleUnauthorized(onError: (message: string | null) => void) {
  onError(SESSION_EXPIRED_MESSAGE);
}

export function EmailVerificationStep({
  accountEmail,
  onVerifiedChange,
  onError,
}: EmailVerificationStepProps) {
  const { status: sessionStatus } = useSession();
  const [email, setEmail] = useState<string | null>(accountEmail ?? null);
  const [code, setCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const sendCode = useCallback(async () => {
    if (sessionStatus !== "authenticated") {
      return;
    }

    setIsSending(true);
    onError(null);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        credentials: "include",
      });

      const payload = (await response.json().catch(() => null)) as {
        email?: string;
        cooldownSeconds?: number;
        devCode?: string;
        message?: string;
        error?: string;
      } | null;

      if (response.status === 401) {
        handleUnauthorized(onError);
        setIsSending(false);
        return;
      }

      if (!response.ok) {
        if (payload?.email) {
          setEmail(payload.email);
        }
        if (payload?.cooldownSeconds) {
          setCooldownSeconds(payload.cooldownSeconds);
        }
        if (response.status === 429) {
          setStatusMessage("A code was already sent. Check your inbox or wait to resend.");
          setIsSending(false);
          return;
        }
        onError(payload?.message ?? payload?.error ?? "Unable to send code.");
        setIsSending(false);
        return;
      }

      setEmail(payload?.email ?? accountEmail ?? null);
      setCooldownSeconds(payload?.cooldownSeconds ?? 0);
      setDevCode(payload?.devCode ?? null);
      setStatusMessage(
        payload?.devCode
          ? `Dev mode: your code is ${payload.devCode}`
          : "We sent a verification code to your inbox.",
      );
    } catch {
      onError("Unable to send verification code. Try again.");
    } finally {
      setIsSending(false);
    }
  }, [accountEmail, onError, sessionStatus]);

  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      if (sessionStatus === "unauthenticated") {
        onError(SESSION_EXPIRED_MESSAGE);
      }
      return;
    }

    let cancelled = false;

    async function loadStatus() {
      onError(null);

      try {
        const response = await fetch("/api/auth/verify-email", {
          credentials: "include",
        });
        const payload = (await response.json().catch(() => null)) as {
          emailVerified?: boolean;
          email?: string | null;
          error?: string;
        } | null;

        if (cancelled) {
          return;
        }

        if (response.status === 401) {
          handleUnauthorized(onError);
          return;
        }

        if (!payload) {
          onError("Unable to load verification status.");
          return;
        }

        if (payload.email) {
          setEmail(payload.email);
        }

        if (payload.emailVerified) {
          setIsVerified(true);
          onVerifiedChange(true);
          setStatusMessage("Your email is verified.");
          return;
        }

        void sendCode();
      } catch {
        if (!cancelled) {
          onError("Unable to load verification status.");
        }
      }
    }

    void loadStatus();

    return () => {
      cancelled = true;
    };
  }, [onError, onVerifiedChange, sendCode, sessionStatus]);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCooldownSeconds((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  async function handleConfirm() {
    if (sessionStatus !== "authenticated") {
      handleUnauthorized(onError);
      return;
    }

    if (code.length !== EMAIL_VERIFICATION.codeLength) {
      onError(`Enter the ${EMAIL_VERIFICATION.codeLength}-digit code.`);
      return;
    }

    setIsConfirming(true);
    onError(null);

    try {
      const response = await fetch("/api/auth/verify-email/confirm", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (response.status === 401) {
        handleUnauthorized(onError);
        setIsConfirming(false);
        return;
      }

      if (!response.ok) {
        onError(payload?.error ?? "Incorrect code. Try again.");
        setIsConfirming(false);
        return;
      }

      setIsVerified(true);
      onVerifiedChange(true);
      setStatusMessage("Email verified.");
      setDevCode(null);
    } catch {
      onError("Unable to verify code. Try again.");
    } finally {
      setIsConfirming(false);
    }
  }

  const showSessionRecovery =
    sessionStatus === "unauthenticated" ||
    (sessionStatus === "authenticated" && !email && !isVerified);

  return (
    <div className="founder-card-glass space-y-5 rounded-3xl border border-border p-5 shadow-founder-card sm:p-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {email
            ? `Enter the ${EMAIL_VERIFICATION.codeLength}-digit code we sent to ${maskEmail(email)}.`
            : "We'll send a verification code to your account email."}
        </p>
        {statusMessage ? (
          <p className="text-sm text-teal/90">{statusMessage}</p>
        ) : null}
        {devCode ? (
          <p className="rounded-xl border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
            SMTP is not configured — use code{" "}
            <span className="font-mono font-semibold text-foreground">{devCode}</span>{" "}
            in development.
          </p>
        ) : null}
      </div>

      {showSessionRecovery ? (
        <p className="text-sm text-muted-foreground">
          <a href={ROUTES.login} className="font-semibold text-teal hover:underline">
            Sign in
          </a>{" "}
          to continue email verification.
        </p>
      ) : null}

      {!isVerified ? (
        <>
          <div className="space-y-2">
            <label htmlFor="verify-email-code" className={authLabelClassName}>
              Verification code
            </label>
            <Input
              id="verify-email-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={EMAIL_VERIFICATION.codeLength}
              value={code}
              onChange={(event) => {
                const next = event.target.value.replace(/\D/g, "");
                setCode(next.slice(0, EMAIL_VERIFICATION.codeLength));
                onError(null);
              }}
              placeholder="000000"
              className={authFieldClassName}
              disabled={sessionStatus !== "authenticated"}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              className="h-11 bg-teal font-extrabold text-ink shadow-brutal-teal hover:bg-teal/80 disabled:opacity-60"
              disabled={
                sessionStatus !== "authenticated" ||
                isConfirming ||
                code.length !== EMAIL_VERIFICATION.codeLength
              }
              aria-busy={isConfirming}
              onClick={() => void handleConfirm()}
            >
              {isConfirming ? "Verifying…" : "Verify email"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:bg-muted hover:text-foreground"
              disabled={
                sessionStatus !== "authenticated" || isSending || cooldownSeconds > 0
              }
              onClick={() => void sendCode()}
            >
              {isSending
                ? "Sending…"
                : cooldownSeconds > 0
                  ? `Resend in ${cooldownSeconds}s`
                  : "Resend code"}
            </Button>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-teal/30 bg-teal/10 px-4 py-3 text-sm text-teal">
          Email verified — you can continue setting up your profile.
        </div>
      )}
    </div>
  );
}
