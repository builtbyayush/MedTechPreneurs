"use client";

import { useCallback, useEffect, useState } from "react";

import {
  authFieldClassName,
  authLabelClassName,
} from "@/components/features/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EMAIL_VERIFICATION } from "@/config/email";

type EmailVerificationStepProps = {
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

export function EmailVerificationStep({
  onVerifiedChange,
  onError,
}: EmailVerificationStepProps) {
  const [email, setEmail] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const sendCode = useCallback(async () => {
    setIsSending(true);
    onError(null);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as {
        email?: string;
        cooldownSeconds?: number;
        devCode?: string;
        message?: string;
        error?: string;
      } | null;

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

      setEmail(payload?.email ?? null);
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
  }, [onError]);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        const response = await fetch("/api/auth/verify-email");
        const payload = (await response.json().catch(() => null)) as {
          emailVerified?: boolean;
          email?: string | null;
        } | null;

        if (cancelled || !payload) {
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
        onError("Unable to load verification status.");
      }
    }

    void loadStatus();

    return () => {
      cancelled = true;
    };
  }, [onError, onVerifiedChange, sendCode]);

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
    if (code.length !== EMAIL_VERIFICATION.codeLength) {
      onError(`Enter the ${EMAIL_VERIFICATION.codeLength}-digit code.`);
      return;
    }

    setIsConfirming(true);
    onError(null);

    try {
      const response = await fetch("/api/auth/verify-email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

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
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              className="h-11 bg-teal font-extrabold text-ink shadow-brutal-teal hover:bg-teal/80 disabled:opacity-60"
              disabled={isConfirming || code.length !== EMAIL_VERIFICATION.codeLength}
              aria-busy={isConfirming}
              onClick={() => void handleConfirm()}
            >
              {isConfirming ? "Verifying…" : "Verify email"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:bg-muted hover:text-foreground"
              disabled={isSending || cooldownSeconds > 0}
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
