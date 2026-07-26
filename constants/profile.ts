/** Placeholder photo path used until real uploads ship */
export const PROFILE_PHOTO_PLACEHOLDER =
  "/images/landing/founder-card-ananya-sharma.jpg";

export function isProfilePhotoPlaceholder(url?: string | null): boolean {
  const normalized = url?.trim();
  return !normalized || normalized === PROFILE_PHOTO_PLACEHOLDER;
}

export const PROFILE_LIMITS = {
  headline: 120,
  bio: 280,
  companyName: 80,
  skillMin: 2,
  skillMax: 32,
  maxSkills: 8,
  maxExperience: 60,
} as const;
