import { z } from "zod";

import {
  BUILDING_TYPES,
  CURRENT_STAGES,
  FOUNDER_ROLES,
  LOOKING_FOR_ROLES,
} from "@/types/onboarding";

export const founderRoleStepSchema = z.object({
  founderRole: z.enum(FOUNDER_ROLES, {
    message: "Choose the option that best describes you",
  }),
});

export const buildingFocusStepSchema = z.object({
  buildingFocus: z.enum(BUILDING_TYPES, {
    message: "Choose what you are building",
  }),
});

export const currentStageStepSchema = z.object({
  currentStage: z.enum(CURRENT_STAGES, {
    message: "Choose your current stage",
  }),
});

export const lookingForStepSchema = z.object({
  lookingForRoles: z
    .array(z.enum(LOOKING_FOR_ROLES))
    .min(1, "Select at least one partnership type"),
});

export const locationStepSchema = z.object({
  country: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
});

export const completeOnboardingSchema = z.object({
  founderRole: z.enum(FOUNDER_ROLES),
  buildingFocus: z.enum(BUILDING_TYPES),
  currentStage: z.enum(CURRENT_STAGES),
  lookingForRoles: z.array(z.enum(LOOKING_FOR_ROLES)).min(1),
  country: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
});

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
