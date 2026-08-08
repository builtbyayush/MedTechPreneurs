"use client";

import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";

import { OnboardingOptionCard } from "@/components/features/onboarding/onboarding-option-card";
import { IndiaLocationFields } from "@/components/features/location/india-location-fields";
import {
  authLabelClassName,
} from "@/components/features/auth/auth-shell";
import { profileUpdateSchema } from "@/lib/validations/profile";
import { INDIA_COUNTRY_NAME } from "@/lib/locations/india";
import {
  BUILDING_TYPES,
  BUILDING_TYPE_LABELS,
  CURRENT_STAGES,
  CURRENT_STAGE_LABELS,
  FOUNDER_ROLES,
  FOUNDER_ROLE_LABELS,
  LOOKING_FOR_ROLES,
  LOOKING_FOR_ROLE_LABELS,
  type BuildingType,
  type CurrentStage,
  type FounderRole,
  type LookingForRole,
} from "@/types/onboarding";
import { cn } from "@/lib/utils";

type ProfileFormValues = z.infer<typeof profileUpdateSchema>;

type ProfileFounderFieldsProps = {
  form: UseFormReturn<ProfileFormValues>;
};

export function ProfileFounderFields({ form }: ProfileFounderFieldsProps) {
  const founderRole = form.watch("founderRole");
  const buildingFocus = form.watch("buildingFocus");
  const currentStage = form.watch("currentStage");
  const lookingForRoles = form.watch("lookingForRoles") ?? [];

  function toggleLookingFor(role: LookingForRole) {
    const current = form.getValues("lookingForRoles") ?? [];
    const next = current.includes(role)
      ? current.filter((item) => item !== role)
      : [...current, role];

    form.setValue("lookingForRoles", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <div className="space-y-5">
      <FieldGroup label="Founder role">
        <div className="grid gap-2 sm:grid-cols-2">
          {FOUNDER_ROLES.map((role) => (
            <OnboardingOptionCard
              key={role}
              label={FOUNDER_ROLE_LABELS[role]}
              selected={founderRole === role}
              onSelect={() =>
                form.setValue("founderRole", role as FounderRole, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Building focus">
        <div className="grid gap-2 sm:grid-cols-2">
          {BUILDING_TYPES.map((type) => (
            <OnboardingOptionCard
              key={type}
              label={BUILDING_TYPE_LABELS[type]}
              selected={buildingFocus === type}
              onSelect={() =>
                form.setValue("buildingFocus", type as BuildingType, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Current stage">
        <div className="grid gap-2 sm:grid-cols-2">
          {CURRENT_STAGES.map((stage) => (
            <OnboardingOptionCard
              key={stage}
              label={CURRENT_STAGE_LABELS[stage]}
              selected={currentStage === stage}
              onSelect={() =>
                form.setValue("currentStage", stage as CurrentStage, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Looking for">
        <div className="grid gap-2 sm:grid-cols-2">
          {LOOKING_FOR_ROLES.map((role) => (
            <OnboardingOptionCard
              key={role}
              label={LOOKING_FOR_ROLE_LABELS[role]}
              selected={lookingForRoles.includes(role)}
              onSelect={() => toggleLookingFor(role)}
            />
          ))}
        </div>
        {form.formState.errors.lookingForRoles ? (
          <p className="text-sm text-coral" role="alert">
            {form.formState.errors.lookingForRoles.message}
          </p>
        ) : null}
      </FieldGroup>

      <IndiaLocationFields
        country={form.watch("country") || INDIA_COUNTRY_NAME}
        state={form.watch("state") ?? ""}
        city={form.watch("city") ?? ""}
        countryId="profile-country"
        stateId="profile-state"
        cityId="profile-city"
        onChange={(next) => {
          form.setValue("country", next.country, {
            shouldDirty: true,
            shouldValidate: true,
          });
          form.setValue("state", next.state, {
            shouldDirty: true,
            shouldValidate: true,
          });
          form.setValue("city", next.city, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
      />

      <p className="text-xs leading-relaxed text-teal/80">
        Changes here update compatibility scores immediately across Discovery and
        Matches.
      </p>
    </div>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-3")}>
      <p className={authLabelClassName}>{label}</p>
      {children}
    </div>
  );
}
