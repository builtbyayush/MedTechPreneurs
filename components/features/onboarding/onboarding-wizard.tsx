"use client";

import { AnimatePresence, motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  accountStepSchema,
  categoriesExcluding,
  categoryStepSchema,
  lookingForStepSchema,
  onboardingFormSchema,
  profileStepSchema,
  type OnboardingFormValues,
} from "@/lib/validations/onboarding";
import {
  CATEGORY_LABELS,
  GENDER_LABELS,
  GENDERS,
  USER_CATEGORIES,
  type UserCategory,
} from "@/types/user";

type FormValues = OnboardingFormValues;

const STEPS = [
  {
    title: "Create account",
    description: "Start with your email and a secure password.",
    fields: ["email", "password", "confirmPassword"] as const,
    schema: accountStepSchema,
  },
  {
    title: "What defines you?",
    description: "Pick the category that best describes you today.",
    fields: ["category"] as const,
    schema: categoryStepSchema,
  },
  {
    title: "Who are you looking for?",
    description: "Choose one or more co-founder types (not your own).",
    fields: ["lookingFor"] as const,
    schema: lookingForStepSchema,
  },
  {
    title: "Core profile",
    description: "A few details so others can understand your background.",
    fields: [
      "name",
      "gender",
      "age",
      "profession",
      "specialisation",
      "mobile",
    ] as const,
    schema: profileStepSchema,
  },
] as const;

const stepMotion = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.22, ease: "easeOut" as const },
};

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      category: undefined,
      lookingFor: [],
      name: "",
      gender: undefined,
      age: undefined,
      profession: "",
      specialisation: "",
      mobile: "",
    },
    mode: "onTouched",
  });

  const category = form.watch("category");
  const lookingForOptions = useMemo(
    () => (category ? categoriesExcluding(category) : [...USER_CATEGORIES]),
    [category]
  );

  async function handleNext() {
    setSubmitError(null);
    const current = STEPS[step];
    const values = form.getValues();
    const parsed = current.schema.safeParse(values);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (typeof path === "string") {
          form.setError(path as keyof FormValues, { message: issue.message });
        }
      }
      return;
    }

    if (step === 1 && category) {
      const filtered = form
        .getValues("lookingFor")
        .filter((item) => item !== category);
      form.setValue("lookingFor", filtered);
    }

    if (step < STEPS.length - 1) {
      setStep((value) => value + 1);
      return;
    }

    await handleSubmit();
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setSubmitError(null);

    const values = form.getValues();
    const parsed = onboardingFormSchema.safeParse(values);

    if (!parsed.success) {
      setSubmitError("Please fix the highlighted fields and try again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const payload = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setSubmitError(payload.error ?? "Unable to create your account.");
        setIsSubmitting(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setSubmitError(
          "Account created, but sign-in failed. Please log in manually."
        );
        setIsSubmitting(false);
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-lg border-none bg-white shadow-sm ring-1 ring-deep-blue/10">
      <CardHeader>
        <p className="text-xs font-medium tracking-wide text-teal uppercase">
          Step {step + 1} of {STEPS.length}
        </p>
        <CardTitle className="text-2xl text-deep-blue">
          {STEPS[step].title}
        </CardTitle>
        <CardDescription>{STEPS[step].description}</CardDescription>
        <div className="mt-2 flex gap-1.5">
          {STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full ${
                index <= step ? "bg-teal" : "bg-deep-blue/10"
              }`}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div key={step} {...stepMotion}>
            <FieldGroup>
              {step === 0 && (
                <>
                  <Field data-invalid={!!form.formState.errors.email}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      aria-invalid={!!form.formState.errors.email}
                      {...form.register("email")}
                    />
                    <FieldError errors={[form.formState.errors.email]} />
                  </Field>

                  <Field data-invalid={!!form.formState.errors.password}>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      aria-invalid={!!form.formState.errors.password}
                      {...form.register("password")}
                    />
                    <FieldError errors={[form.formState.errors.password]} />
                  </Field>

                  <Field data-invalid={!!form.formState.errors.confirmPassword}>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirm password
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      aria-invalid={!!form.formState.errors.confirmPassword}
                      {...form.register("confirmPassword")}
                    />
                    <FieldError
                      errors={[form.formState.errors.confirmPassword]}
                    />
                  </Field>
                </>
              )}

              {step === 1 && (
                <Controller
                  control={form.control}
                  name="category"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <RadioGroup
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value as UserCategory);
                          const nextLookingFor = form
                            .getValues("lookingFor")
                            .filter((item) => item !== value);
                          form.setValue("lookingFor", nextLookingFor);
                        }}
                        className="gap-3"
                      >
                        {USER_CATEGORIES.map((item) => (
                          <FieldLabel
                            key={item}
                            className="cursor-pointer rounded-lg border border-deep-blue/10 px-3 py-3 has-data-checked:border-teal has-data-checked:bg-teal/5"
                          >
                            <RadioGroupItem value={item} />
                            <span>{CATEGORY_LABELS[item]}</span>
                          </FieldLabel>
                        ))}
                      </RadioGroup>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              )}

              {step === 2 && (
                <Controller
                  control={form.control}
                  name="lookingFor"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <div className="flex flex-col gap-3">
                        {lookingForOptions.map((item) => {
                          const checked = field.value.includes(item);
                          return (
                            <FieldLabel
                              key={item}
                              className="cursor-pointer rounded-lg border border-deep-blue/10 px-3 py-3 has-data-checked:border-teal has-data-checked:bg-teal/5"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(next) => {
                                  if (next) {
                                    field.onChange([...field.value, item]);
                                  } else {
                                    field.onChange(
                                      field.value.filter(
                                        (value) => value !== item
                                      )
                                    );
                                  }
                                }}
                              />
                              <span>{CATEGORY_LABELS[item]}</span>
                            </FieldLabel>
                          );
                        })}
                      </div>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              )}

              {step === 3 && (
                <>
                  <Field data-invalid={!!form.formState.errors.name}>
                    <FieldLabel htmlFor="name">Full name</FieldLabel>
                    <Input
                      id="name"
                      autoComplete="name"
                      aria-invalid={!!form.formState.errors.name}
                      {...form.register("name")}
                    />
                    <FieldError errors={[form.formState.errors.name]} />
                  </Field>

                  <Controller
                    control={form.control}
                    name="gender"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={!!fieldState.error}>
                        <FieldLabel>Gender</FieldLabel>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="gap-3"
                        >
                          {GENDERS.map((item) => (
                            <FieldLabel
                              key={item}
                              className="cursor-pointer rounded-lg border border-deep-blue/10 px-3 py-3 has-data-checked:border-teal has-data-checked:bg-teal/5"
                            >
                              <RadioGroupItem value={item} />
                              <span>{GENDER_LABELS[item]}</span>
                            </FieldLabel>
                          ))}
                        </RadioGroup>
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />

                  <Field data-invalid={!!form.formState.errors.age}>
                    <FieldLabel htmlFor="age">Age</FieldLabel>
                    <Input
                      id="age"
                      type="number"
                      min={18}
                      max={100}
                      aria-invalid={!!form.formState.errors.age}
                      {...form.register("age")}
                    />
                    <FieldError errors={[form.formState.errors.age]} />
                  </Field>

                  <Field data-invalid={!!form.formState.errors.profession}>
                    <FieldLabel htmlFor="profession">Profession</FieldLabel>
                    <Input
                      id="profession"
                      placeholder="e.g. Cardiologist, Backend engineer"
                      aria-invalid={!!form.formState.errors.profession}
                      {...form.register("profession")}
                    />
                    <FieldError errors={[form.formState.errors.profession]} />
                  </Field>

                  <Field
                    data-invalid={!!form.formState.errors.specialisation}
                  >
                    <FieldLabel htmlFor="specialisation">
                      Specialisation
                    </FieldLabel>
                    <Input
                      id="specialisation"
                      placeholder="e.g. Interventional cardiology, AI/ML"
                      aria-invalid={!!form.formState.errors.specialisation}
                      {...form.register("specialisation")}
                    />
                    <FieldError
                      errors={[form.formState.errors.specialisation]}
                    />
                  </Field>

                  <Field data-invalid={!!form.formState.errors.mobile}>
                    <FieldLabel htmlFor="mobile">Mobile</FieldLabel>
                    <Input
                      id="mobile"
                      type="tel"
                      autoComplete="tel"
                      placeholder="9876543210"
                      aria-invalid={!!form.formState.errors.mobile}
                      {...form.register("mobile")}
                    />
                    <FieldError errors={[form.formState.errors.mobile]} />
                  </Field>
                </>
              )}
            </FieldGroup>
          </motion.div>
        </AnimatePresence>

        {submitError && (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {submitError}
          </p>
        )}
      </CardContent>

      <CardFooter className="justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          disabled={step === 0 || isSubmitting}
          onClick={() => {
            setSubmitError(null);
            setStep((value) => Math.max(0, value - 1));
          }}
        >
          Back
        </Button>
        <Button
          type="button"
          className="bg-teal font-semibold text-ink hover:bg-teal/90"
          disabled={isSubmitting}
          onClick={handleNext}
        >
          {step === STEPS.length - 1
            ? isSubmitting
              ? "Creating account…"
              : "Finish"
            : "Continue"}
        </Button>
      </CardFooter>
    </Card>
  );
}
