import type {
  BuildingType,
  CurrentStage,
  FounderRole,
  LookingForRole,
} from "@/types/onboarding";

export type DiscoveryActionType = "pass" | "connect";

export type DiscoveryFeedStatus = "founder" | "empty" | "no-more";

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
  verified: boolean;
};

export type DiscoveryFeedResponse = {
  status: DiscoveryFeedStatus;
  founder?: DiscoveryFounder;
  remainingCount?: number;
  passedCount?: number;
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
