export const FOUNDER_ROLES = [
  "doctor",
  "engineer",
  "researcher",
  "business",
  "designer",
  "investor",
  "student",
  "other",
] as const;

export type FounderRole = (typeof FOUNDER_ROLES)[number];

export const FOUNDER_ROLE_LABELS: Record<FounderRole, string> = {
  doctor: "Doctor",
  engineer: "Engineer",
  researcher: "Researcher",
  business: "Business",
  designer: "Designer",
  investor: "Investor",
  student: "Student",
  other: "Other",
};

export const BUILDING_TYPES = [
  "medical-device",
  "digital-health",
  "ai-healthcare",
  "biotech",
  "diagnostics",
  "pharma",
  "healthcare-saas",
  "marketplace",
  "other",
] as const;

export type BuildingType = (typeof BUILDING_TYPES)[number];

export const BUILDING_TYPE_LABELS: Record<BuildingType, string> = {
  "medical-device": "Medical Device",
  "digital-health": "Digital Health",
  "ai-healthcare": "AI Healthcare",
  biotech: "Biotech",
  diagnostics: "Diagnostics",
  pharma: "Pharma",
  "healthcare-saas": "Healthcare SaaS",
  marketplace: "Marketplace",
  other: "Other",
};

export const CURRENT_STAGES = [
  "idea",
  "prototype",
  "mvp",
  "revenue",
  "scaling",
] as const;

export type CurrentStage = (typeof CURRENT_STAGES)[number];

export const CURRENT_STAGE_LABELS: Record<CurrentStage, string> = {
  idea: "Idea",
  prototype: "Prototype",
  mvp: "MVP",
  revenue: "Revenue",
  scaling: "Scaling",
};

export const LOOKING_FOR_ROLES = [
  "doctor",
  "engineer",
  "business",
  "researcher",
  "designer",
  "investor",
  "advisor",
] as const;

export type LookingForRole = (typeof LOOKING_FOR_ROLES)[number];

export const LOOKING_FOR_ROLE_LABELS: Record<LookingForRole, string> = {
  doctor: "Doctor",
  engineer: "Engineer",
  business: "Business",
  researcher: "Researcher",
  designer: "Designer",
  investor: "Investor",
  advisor: "Advisor",
};

export const PARTNERSHIP_GOALS = [
  "seeking-mentorship",
  "providing-mentorship",
  "seeking-investment",
  "providing-investment",
  "finding-partnership",
] as const;

export type PartnershipGoal = (typeof PARTNERSHIP_GOALS)[number];

export const PARTNERSHIP_GOAL_LABELS: Record<PartnershipGoal, string> = {
  "seeking-mentorship": "Seeking Mentorship",
  "providing-mentorship": "Providing Mentorship",
  "seeking-investment": "Seeking Investment",
  "providing-investment": "Providing Investment",
  "finding-partnership": "Finding the Right Partnership",
};

export const ONBOARDING_STEP_COUNT = 9;

export type OnboardingFormState = {
  founderRole?: FounderRole;
  buildingFocus?: BuildingType;
  currentStage?: CurrentStage;
  lookingForRoles: LookingForRole[];
  partnershipGoals: PartnershipGoal[];
  country: string;
  city: string;
};
