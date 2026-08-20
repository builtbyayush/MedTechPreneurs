"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import {
  authFieldClassName,
  authLabelClassName,
} from "@/components/features/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { useToast } from "@/hooks/use-toast";

export function ChangePasswordForm() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
        error?: string;
      } | null;

      if (!response.ok) {
        const message =
          payload?.message ?? payload?.error ?? "Unable to change password.";
        setError(message);
        toast({
          title: "Password not changed",
          description: message,
          variant: "error",
        });
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast({
        title: "Password changed successfully",
        description:
          payload?.message ?? "Your new password is active on this account.",
        variant: "success",
      });
    } catch {
      const message = "Unable to change password. Please try again.";
      setError(message);
      toast({
        title: "Password not changed",
        description: message,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <label htmlFor="current-password" className={authLabelClassName}>
          Current password
        </label>
        <PasswordInput
          id="current-password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          disabled={isSubmitting}
          className={authFieldClassName}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="new-password" className={authLabelClassName}>
          New password
        </label>
        <PasswordInput
          id="new-password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          disabled={isSubmitting}
          className={authFieldClassName}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirm-new-password" className={authLabelClassName}>
          Confirm new password
        </label>
        <PasswordInput
          id="confirm-new-password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={isSubmitting}
          className={authFieldClassName}
          required
        />
      </div>

      {error ? (
        <p className="text-sm text-coral" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-teal font-bold text-ink hover:bg-teal/90"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Changing password…
          </>
        ) : (
          "Change password"
        )}
      </Button>
    </form>
  );
}
