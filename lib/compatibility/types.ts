import type {
  BuildingType,
  CurrentStage,
  FounderRole,
  LookingForRole,
} from "@/types/onboarding";

export type CompatibilityFactorKey =
  | "complementaryRoles"
  | "buildingFocus"
  | "stageSimilarity"
  | "lookingForAlignment"
  | "locationProximity";

export type CompatibilityProfile = {
  founderRole: FounderRole;
  buildingFocus: BuildingType;
  currentStage: CurrentStage;
  lookingForRoles: LookingForRole[];
  country?: string;
  city?: string;
};

export type CompatibilityFactorResult = {
  key: CompatibilityFactorKey;
  label: string;
  score: number;
  weight: number;
  weightedScore: number;
  matched: boolean;
  reason: string;
};

export type CompatibilityResult = {
  score: number;
  matchedFactors: string[];
  missingFactors: string[];
  explanation: string;
  topReasons: string[];
  factors: CompatibilityFactorResult[];
};

export type CompatibilityWeights = Record<CompatibilityFactorKey, number>;

export type CompatibilityCache = Map<string, CompatibilityResult>;
