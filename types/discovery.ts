import type {
  BuildingType,
  CurrentStage,
  FounderRole,
  LookingForRole,
} from "@/types/onboarding";

export type DiscoveryActionType = "pass" | "connect";

export type DiscoveryFeedStatus =
  | "founder"
  | "empty"
  | "no-more"
  | "no-results";

export type DiscoveryProfessionOption = {
  value: import("@/types/onboarding").FounderRole;
  label: string;
};

export type DiscoveryAppliedFilters = {
  query?: string;
  professions: import("@/types/onboarding").FounderRole[];
};

export type DiscoveryFounder = {
  id: string;
  name: string;
  headline?: string;
  founderRole: FounderRole;
  buildingFocus: BuildingType;
  currentStage: CurrentStage;
  lookingForRoles: LookingForRole[];
  location: string;
  bio: string;
  skills: string[];
  yearsExperience?: number;
  companyName?: string;
  profilePhotoUrl?: string;
  compatibilityScore: number;
  compatibilityReasons: string[];
  compatibilityExplanation: string;
  /** Email verified — the current MVP trust signal. */
  verified: boolean;
};

export type DiscoveryFeedResponse = {
  status: DiscoveryFeedStatus;
  founder?: DiscoveryFounder;
  remainingCount?: number;
  passedCount?: number;
  filtersApplied?: boolean;
  appliedFilters?: DiscoveryAppliedFilters;
  professionOptions?: DiscoveryProfessionOption[];
};

export type DiscoveryActionResponse = {
  ok: true;
  action: DiscoveryActionType;
};

export type DiscoverySearchResult = {
  id: string;
  name: string;
  headline?: string;
  founderRoleLabel: string;
  companyName?: string;
  compatibilityScore: number;
};

export type DiscoverySearchResponse = {
  results: DiscoverySearchResult[];
  query: string;
};
