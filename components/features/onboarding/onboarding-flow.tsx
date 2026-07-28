"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { OnboardingOptionCard } from "@/components/features/onboarding/onboarding-option-card";
import { OnboardingShell } from "@/components/features/onboarding/onboarding-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import {
  authFieldClassName,
  authLabelClassName,
} from "@/components/features/auth/auth-shell";
import {
  buildingFocusStepSchema,
  completeOnboardingSchema,
  currentStageStepSchema,
  founderRoleStepSchema,
  locationStepSchema,
  lookingForStepSchema,
} from "@/lib/validations/onboarding";
import { getFirstName } from "@/lib/user/display-name";
import { fadeUpTransition } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import {
  BUILDING_TYPES,
  BUILDING_TYPE_LABELS,
  CURRENT_STAGES,
  CURRENT_STAGE_LABELS,
  FOUNDER_ROLES,
  FOUNDER_ROLE_LABELS,
  LOOKING_FOR_ROLES,
  LOOKING_FOR_ROLE_LABELS,
  ONBOARDING_STEP_COUNT,
  type OnboardingFormState,
} from "@/types/onboarding";

const stepMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

type OnboardingFlowProps = {
  userName?: string | null;
};

export function OnboardingFlow({ userName }: OnboardingFlowProps) {
  const router = useRouter();
  const reducedMotion = usePrefersReducedMotion();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<OnboardingFormState>({
    lookingForRoles: [],
    country: "",
    city: "",
  });

  const firstName = getFirstName(userName, "there");

  const stepCopy = useMemo(
    () =>
      [
        {
          eyebrow: "Welcome",
          title: firstName === "there" ? "Welcome to Splice+" : `Hi, ${firstName}`,
          description:
            "We help healthcare founders find the right partners.",
        },
        {
          eyebrow: "About you",
          title: "What best describes you?",
          description: "Choose the role that fits you best today.",
        },
        {
          eyebrow: "Your venture",
          title: "What are you building?",
          description: "Pick the focus closest to your idea.",
        },
        {
          eyebrow: "Traction",
          title: "Current stage",
          description: "Where is your venture right now?",
        },
        {
          eyebrow: "Matching",
          title: "Who are you looking for?",
          description: "Select every partnership type you'd consider.",
        },
        {
          eyebrow: "Location",
          title: "Where are you based?",
          description: "Optional — helps with future location-aware matching.",
        },
        {
          eyebrow: "Review",
          title: "You're almost in",
          description: "Confirm your answers before entering the app.",
        },
      ] as const,
    [firstName],
  );

  function updateForm(partial: Partial<OnboardingFormState>) {
    setForm((current) => ({ ...current, ...partial }));
    setError(null);
  }

  function validateCurrentStep(): boolean {
    if (step === 0) {
      return true;
    }

    if (step === 1) {
      const parsed = founderRoleStepSchema.safeParse(form);
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Choose one option");
        return false;
      }
      return true;
    }

    if (step === 2) {
      const parsed = buildingFocusStepSchema.safeParse(form);
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Choose one option");
        return false;
      }
      return true;
    }

    if (step === 3) {
      const parsed = currentStageStepSchema.safeParse(form);
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Choose one option");
        return false;
      }
      return true;
    }

    if (step === 4) {
      const parsed = lookingForStepSchema.safeParse(form);
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Select at least one option");
        return false;
      }
      return true;
    }

    if (step === 5) {
      locationStepSchema.safeParse(form);
      return true;
    }

    const parsed = completeOnboardingSchema.safeParse(form);
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ??
          "Please complete the required steps before finishing.",
      );
      return false;
    }

    return true;
  }

  function handleContinue() {
    if (!validateCurrentStep()) {
      return;
    }

    if (step < ONBOARDING_STEP_COUNT - 1) {
      setStep((value) => value + 1);
      return;
    }

    void handleFinish();
  }

  function handleBack() {
    setError(null);
    setStep((value) => Math.max(0, value - 1));
  }

  function handleSkipLocation() {
    setError(null);
    setStep(6);
  }

  async function handleFinish() {
    const parsed = completeOnboardingSchema.safeParse(form);
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ??
          "Please complete the required steps before finishing.",
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;

      if (!response.ok) {
        setError(
          payload?.message ??
            payload?.error ??
            "We couldn't save your onboarding. Please try again.",
        );
        setIsSubmitting(false);
        return;
      }

      router.push(ROUTES.app.home);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  function toggleLookingFor(role: (typeof LOOKING_FOR_ROLES)[number]) {
    setForm((current) => {
      const exists = current.lookingForRoles.includes(role);
      return {
        ...current,
        lookingForRoles: exists
          ? current.lookingForRoles.filter((item) => item !== role)
          : [...current.lookingForRoles, role],
      };
    });
    setError(null);
  }

  const copy = stepCopy[step];

  return (
    <OnboardingShell
      step={step}
      footer={
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            className="text-white/70 hover:bg-white/5 hover:text-white"
            disabled={step === 0 || isSubmitting}
            onClick={handleBack}
          >
            Back
          </Button>

          {step === 5 ? (
            <Button
              type="button"
              variant="outline"
              className="border-white/15 bg-transparent text-white/75 hover:bg-white/5 hover:text-white"
              disabled={isSubmitting}
              onClick={handleSkipLocation}
            >
              Skip for now
            </Button>
          ) : null}

          <Button
            type="button"
            className="ml-auto h-11 min-w-[8.5rem] bg-teal font-extrabold text-ink shadow-brutal-teal hover:bg-[#33d6d6] disabled:opacity-60"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            onClick={handleContinue}
          >
            {step === ONBOARDING_STEP_COUNT - 1
              ? isSubmitting
                ? "Finishing…"
                : "Finish"
              : "Continue"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-1 flex-col">
        <header className="mb-8 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
            {copy.eyebrow}
          </p>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {copy.title}
          </h1>
          <p className="max-w-md text-base leading-relaxed text-white/60">
            {copy.description}
          </p>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            {...stepMotion}
            transition={fadeUpTransition(reducedMotion)}
            className="flex flex-1 flex-col"
          >
            {step === 0 ? (
              <div className="founder-card-glass flex flex-1 flex-col justify-center rounded-3xl border border-white/10 p-6 shadow-founder-card sm:p-8">
                <p className="text-lg leading-relaxed text-white/75">
                  A short setup helps us understand who you are, what you&apos;re
                  building, and who you want to meet.
                </p>
                <p className="mt-4 text-sm text-white/45">
                  About two minutes. One question at a time.
                </p>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-3">
                {FOUNDER_ROLES.map((role) => (
                  <OnboardingOptionCard
                    key={role}
                    label={FOUNDER_ROLE_LABELS[role]}
                    selected={form.founderRole === role}
                    onSelect={() => updateForm({ founderRole: role })}
                  />
                ))}
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-3">
                {BUILDING_TYPES.map((type) => (
                  <OnboardingOptionCard
                    key={type}
                    label={BUILDING_TYPE_LABELS[type]}
                    selected={form.buildingFocus === type}
                    onSelect={() => updateForm({ buildingFocus: type })}
                  />
                ))}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-3">
                {CURRENT_STAGES.map((stage) => (
                  <OnboardingOptionCard
                    key={stage}
                    label={CURRENT_STAGE_LABELS[stage]}
                    selected={form.currentStage === stage}
                    onSelect={() => updateForm({ currentStage: stage })}
                  />
                ))}
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-3">
                {LOOKING_FOR_ROLES.map((role) => (
                  <OnboardingOptionCard
                    key={role}
                    label={LOOKING_FOR_ROLE_LABELS[role]}
                    mode="multiple"
                    selected={form.lookingForRoles.includes(role)}
                    onSelect={() => toggleLookingFor(role)}
                  />
                ))}
              </div>
            ) : null}

            {step === 5 ? (
              <div className="founder-card-glass space-y-5 rounded-3xl border border-white/10 p-5 shadow-founder-card sm:p-6">
                <div className="space-y-2">
                  <label htmlFor="onboarding-country" className={authLabelClassName}>
                    Country
                  </label>
                  <Input
                    id="onboarding-country"
                    value={form.country}
                    onChange={(event) =>
                      updateForm({ country: event.target.value })
                    }
                    placeholder="India"
                    autoComplete="country-name"
                    className={authFieldClassName}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="onboarding-city" className={authLabelClassName}>
                    City
                  </label>
                  <Input
                    id="onboarding-city"
                    value={form.city}
                    onChange={(event) => updateForm({ city: event.target.value })}
                    placeholder="Bengaluru"
                    autoComplete="address-level2"
                    className={authFieldClassName}
                  />
                </div>
              </div>
            ) : null}

            {step === 6 ? (
              <div className="founder-card-glass space-y-4 rounded-3xl border border-white/10 p-5 shadow-founder-card sm:p-6">
                <ReviewRow
                  label="You"
                  value={
                    form.founderRole
                      ? FOUNDER_ROLE_LABELS[form.founderRole]
                      : "—"
                  }
                />
                <ReviewRow
                  label="Building"
                  value={
                    form.buildingFocus
                      ? BUILDING_TYPE_LABELS[form.buildingFocus]
                      : "—"
                  }
                />
                <ReviewRow
                  label="Stage"
                  value={
                    form.currentStage
                      ? CURRENT_STAGE_LABELS[form.currentStage]
                      : "—"
                  }
                />
                <ReviewRow
                  label="Looking for"
                  value={
                    form.lookingForRoles.length
                      ? form.lookingForRoles
                          .map((role) => LOOKING_FOR_ROLE_LABELS[role])
                          .join(", ")
                      : "—"
                  }
                />
                <ReviewRow
                  label="Location"
                  value={
                    [form.city, form.country].filter(Boolean).join(", ") ||
                    "Not provided"
                  }
                />
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {error ? (
          <p
            className="mt-6 rounded-xl border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>
    </OnboardingShell>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-4 last:border-b-0 last:pb-0">
      <span className="text-sm text-white/45">{label}</span>
      <span className="max-w-[65%] text-right text-sm font-medium text-white">
        {value}
      </span>
    </div>
  );
}
