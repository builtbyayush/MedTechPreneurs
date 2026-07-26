import { isProfilePhotoPlaceholder } from "@/constants/profile";
import type { ProfileCompletionSummary } from "@/types/home";

type ProfileCompletionInput = {
  profilePhotoUrl?: string | null;
  headline?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  companyName?: string | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
};

const PROFILE_COMPLETION_CHECKS: Array<{
  key: string;
  label: string;
  isComplete: (profile: ProfileCompletionInput) => boolean;
}> = [
  {
    key: "photo",
    label: "Profile photo",
    isComplete: (profile) => !isProfilePhotoPlaceholder(profile.profilePhotoUrl),
  },
  {
    key: "headline",
    label: "Headline",
    isComplete: (profile) => Boolean(profile.headline?.trim()),
  },
  {
    key: "bio",
    label: "Bio",
    isComplete: (profile) => Boolean(profile.bio?.trim()),
  },
  {
    key: "skills",
    label: "Skills",
    isComplete: (profile) => (profile.skills?.length ?? 0) >= 2,
  },
  {
    key: "company",
    label: "Company",
    isComplete: (profile) => Boolean(profile.companyName?.trim()),
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    isComplete: (profile) => Boolean(profile.linkedinUrl?.trim()),
  },
  {
    key: "website",
    label: "Website",
    isComplete: (profile) => Boolean(profile.websiteUrl?.trim()),
  },
];

export function calculateProfileCompletion(
  profile: ProfileCompletionInput,
): ProfileCompletionSummary {
  const items = PROFILE_COMPLETION_CHECKS.map((check) => ({
    key: check.key,
    label: check.label,
    completed: check.isComplete(profile),
  }));

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const percent = Math.round((completedCount / totalCount) * 100);

  return {
    percent,
    completedCount,
    totalCount,
    missingItems: items.filter((item) => !item.completed).map((item) => item.label),
    items,
  };
}
