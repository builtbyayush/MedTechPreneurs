export const USER_CATEGORIES = [
  "healthcare",
  "engineer",
  "entrepreneur",
] as const;

export type UserCategory = (typeof USER_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<UserCategory, string> = {
  healthcare: "Healthcare professional",
  engineer: "Engineer / technologist",
  entrepreneur: "Entrepreneur",
};

export const GENDERS = [
  "male",
  "female",
  "non-binary",
  "prefer-not-to-say",
] as const;

export type Gender = (typeof GENDERS)[number];

export const GENDER_LABELS: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  "non-binary": "Non-binary",
  "prefer-not-to-say": "Prefer not to say",
};
