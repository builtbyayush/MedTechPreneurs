import type {
  BuildingType,
  CurrentStage,
  FounderRole,
  LookingForRole,
} from "@/types/onboarding";

export type FounderProfile = {
  id: string;
  name: string;
  email: string;
  profilePhotoUrl?: string;
  headline?: string;
  bio?: string;
  skills: string[];
  yearsExperience?: number;
  companyName?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  founderRole?: FounderRole;
  buildingFocus?: BuildingType;
  currentStage?: CurrentStage;
  lookingForRoles: LookingForRole[];
  country?: string;
  state?: string;
  city?: string;
};

export type FounderProfileInput = {
  profilePhotoUrl?: string;
  headline?: string;
  bio?: string;
  skills: string[];
  yearsExperience?: number;
  companyName?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
};
