import { z } from "zod";

import { PROFILE_LIMITS } from "@/constants/profile";
import {
  BUILDING_TYPES,
  CURRENT_STAGES,
  FOUNDER_ROLES,
  LOOKING_FOR_ROLES,
} from "@/types/onboarding";

const optionalUrl = z
  .string()
  .trim()
  .url("Enter a valid URL")
  .optional()
  .or(z.literal(""));

const linkedinUrlSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (value) =>
      !value ||
      /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\//i.test(value),
    { message: "Enter a valid LinkedIn profile URL" },
  );

export const profileUpdateSchema = z.object({
  profilePhotoUrl: z.string().trim().max(500).optional().or(z.literal("")),
  headline: z
    .string()
    .trim()
    .max(
      PROFILE_LIMITS.headline,
      `Headline must be ${PROFILE_LIMITS.headline} characters or fewer`,
    )
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(
      PROFILE_LIMITS.bio,
      `Bio must be ${PROFILE_LIMITS.bio} characters or fewer`,
    )
    .optional()
    .or(z.literal("")),
  skills: z
    .array(
      z
        .string()
        .trim()
        .min(
          PROFILE_LIMITS.skillMin,
          `Each skill must be at least ${PROFILE_LIMITS.skillMin} characters`,
        )
        .max(
          PROFILE_LIMITS.skillMax,
          `Each skill must be ${PROFILE_LIMITS.skillMax} characters or fewer`,
        ),
    )
    .max(
      PROFILE_LIMITS.maxSkills,
      `You can add up to ${PROFILE_LIMITS.maxSkills} skills`,
    ),
  yearsExperience: z
    .number()
    .int("Experience must be a whole number")
    .min(0, "Experience cannot be negative")
    .max(
      PROFILE_LIMITS.maxExperience,
      `Enter experience up to ${PROFILE_LIMITS.maxExperience} years`,
    )
    .optional(),
  companyName: z
    .string()
    .trim()
    .max(
      PROFILE_LIMITS.companyName,
      `Company name must be ${PROFILE_LIMITS.companyName} characters or fewer`,
    )
    .optional()
    .or(z.literal("")),
  linkedinUrl: linkedinUrlSchema,
  websiteUrl: optionalUrl,
  founderRole: z.enum(FOUNDER_ROLES).optional(),
  buildingFocus: z.enum(BUILDING_TYPES).optional(),
  currentStage: z.enum(CURRENT_STAGES).optional(),
  lookingForRoles: z
    .array(z.enum(LOOKING_FOR_ROLES))
    .min(1, "Select at least one co-founder type")
    .optional(),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export function normalizeProfileInput(
  input: ProfileUpdateInput,
): ProfileUpdateInput {
  return {
    ...input,
    profilePhotoUrl: input.profilePhotoUrl?.trim() || undefined,
    headline: input.headline?.trim() || undefined,
    bio: input.bio?.trim() || undefined,
    companyName: input.companyName?.trim() || undefined,
    linkedinUrl: input.linkedinUrl?.trim() || undefined,
    websiteUrl: input.websiteUrl?.trim() || undefined,
    country: input.country?.trim() || undefined,
    city: input.city?.trim() || undefined,
    skills: input.skills.map((skill) => skill.trim()).filter(Boolean),
  };
}
