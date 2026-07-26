import {
  BUILDING_TYPE_LABELS,
  CURRENT_STAGE_LABELS,
  FOUNDER_ROLE_LABELS,
  type BuildingType,
  type CurrentStage,
  type FounderRole,
  type LookingForRole,
} from "@/types/onboarding";

import {
  COMPATIBILITY_FACTOR_LABELS,
  COMPATIBILITY_GAP_THRESHOLD,
  COMPATIBILITY_MATCH_THRESHOLD,
  normalizeCompatibilityWeights,
} from "@/lib/compatibility/weights";
import type {
  CompatibilityCache,
  CompatibilityFactorKey,
  CompatibilityFactorResult,
  CompatibilityProfile,
  CompatibilityResult,
  CompatibilityWeights,
} from "@/lib/compatibility/types";

const STAGE_ORDER: CurrentStage[] = [
  "idea",
  "prototype",
  "mvp",
  "revenue",
  "scaling",
];

const BUILDING_CLUSTERS: BuildingType[][] = [
  ["diagnostics", "medical-device", "biotech", "pharma"],
  ["digital-health", "ai-healthcare", "healthcare-saas"],
  ["marketplace", "other"],
];

const ROLE_PAIR_SCORES: Record<string, number> = {
  "business|designer": 82,
  "business|doctor": 84,
  "business|engineer": 92,
  "business|investor": 78,
  "business|other": 70,
  "business|researcher": 86,
  "business|student": 68,
  "designer|doctor": 76,
  "designer|engineer": 88,
  "designer|investor": 72,
  "designer|other": 65,
  "designer|researcher": 74,
  "designer|student": 62,
  "doctor|doctor": 28,
  "doctor|engineer": 95,
  "doctor|investor": 70,
  "doctor|other": 58,
  "doctor|researcher": 86,
  "doctor|student": 55,
  "engineer|engineer": 35,
  "engineer|investor": 74,
  "engineer|other": 60,
  "engineer|researcher": 84,
  "engineer|student": 58,
  "investor|other": 62,
  "investor|researcher": 76,
  "investor|student": 55,
  "other|other": 45,
  "other|researcher": 68,
  "other|student": 50,
  "researcher|researcher": 32,
  "researcher|student": 52,
  "student|student": 40,
};

const FOUNDER_TO_LOOKING: Partial<Record<FounderRole, LookingForRole>> = {
  doctor: "doctor",
  engineer: "engineer",
  researcher: "researcher",
  business: "business",
  designer: "designer",
  investor: "investor",
};

function getRolePairKey(roleA: FounderRole, roleB: FounderRole): string {
  return [roleA, roleB].sort().join("|");
}

function scoreComplementaryRoles(
  viewer: CompatibilityProfile,
  candidate: CompatibilityProfile,
): Pick<CompatibilityFactorResult, "score" | "reason"> {
  const score =
    ROLE_PAIR_SCORES[getRolePairKey(viewer.founderRole, candidate.founderRole)] ??
    55;

  if (score >= COMPATIBILITY_MATCH_THRESHOLD) {
    return {
      score,
      reason: `Complementary ${FOUNDER_ROLE_LABELS[viewer.founderRole].toLowerCase()} and ${FOUNDER_ROLE_LABELS[candidate.founderRole].toLowerCase()} founder mix`,
    };
  }

  if (viewer.founderRole === candidate.founderRole) {
    return {
      score,
      reason: `Both founders share the same ${FOUNDER_ROLE_LABELS[viewer.founderRole].toLowerCase()} role focus`,
    };
  }

  return {
    score,
    reason: "Founder roles overlap more than they complement each other",
  };
}

function getBuildingClusterIndex(focus: BuildingType): number {
  return BUILDING_CLUSTERS.findIndex((cluster) => cluster.includes(focus));
}

function scoreBuildingFocus(
  viewer: CompatibilityProfile,
  candidate: CompatibilityProfile,
): Pick<CompatibilityFactorResult, "score" | "reason"> {
  if (viewer.buildingFocus === candidate.buildingFocus) {
    return {
      score: 100,
      reason: `You're both building in ${BUILDING_TYPE_LABELS[viewer.buildingFocus]}`,
    };
  }

  const viewerCluster = getBuildingClusterIndex(viewer.buildingFocus);
  const candidateCluster = getBuildingClusterIndex(candidate.buildingFocus);

  if (viewerCluster >= 0 && viewerCluster === candidateCluster) {
    return {
      score: 72,
      reason: `Both are working in adjacent ${BUILDING_TYPE_LABELS[viewer.buildingFocus]} and ${BUILDING_TYPE_LABELS[candidate.buildingFocus]} areas`,
    };
  }

  return {
    score: 38,
    reason: "Building focus areas diverge",
  };
}

function scoreStageSimilarity(
  viewer: CompatibilityProfile,
  candidate: CompatibilityProfile,
): Pick<CompatibilityFactorResult, "score" | "reason"> {
  const viewerIndex = STAGE_ORDER.indexOf(viewer.currentStage);
  const candidateIndex = STAGE_ORDER.indexOf(candidate.currentStage);
  const difference = Math.abs(viewerIndex - candidateIndex);

  if (difference === 0) {
    return {
      score: 100,
      reason: `Both are at the ${CURRENT_STAGE_LABELS[viewer.currentStage]} stage`,
    };
  }

  if (difference === 1) {
    return {
      score: 78,
      reason: `Similar startup stages (${CURRENT_STAGE_LABELS[viewer.currentStage]} and ${CURRENT_STAGE_LABELS[candidate.currentStage]})`,
    };
  }

  if (difference === 2) {
    return {
      score: 52,
      reason: "Startup stages are moderately apart",
    };
  }

  return {
    score: 28,
    reason: "Startup stages are far apart",
  };
}

function scoreLookingForAlignment(
  viewer: CompatibilityProfile,
  candidate: CompatibilityProfile,
): Pick<CompatibilityFactorResult, "score" | "reason"> {
  const viewerRole = FOUNDER_TO_LOOKING[viewer.founderRole];
  const candidateRole = FOUNDER_TO_LOOKING[candidate.founderRole];

  const viewerSeeksCandidate =
    candidateRole !== undefined &&
    viewer.lookingForRoles.includes(candidateRole);
  const candidateSeeksViewer =
    viewerRole !== undefined && candidate.lookingForRoles.includes(viewerRole);

  if (viewerSeeksCandidate && candidateSeeksViewer) {
    return {
      score: 100,
      reason: "Each is looking for the other's expertise",
    };
  }

  if (viewerSeeksCandidate || candidateSeeksViewer) {
    return {
      score: 72,
      reason: "One founder is explicitly looking for the other's role",
    };
  }

  return {
    score: 24,
    reason: "Looking-for preferences don't align yet",
  };
}

function normalizeLocation(value?: string): string {
  return value?.trim().toLowerCase() ?? "";
}

function scoreLocationProximity(
  viewer: CompatibilityProfile,
  candidate: CompatibilityProfile,
): Pick<CompatibilityFactorResult, "score" | "reason"> {
  const viewerCity = normalizeLocation(viewer.city);
  const candidateCity = normalizeLocation(candidate.city);
  const viewerCountry = normalizeLocation(viewer.country);
  const candidateCountry = normalizeLocation(candidate.country);

  if (viewerCity && viewerCity === candidateCity) {
    return {
      score: 100,
      reason: `Both founders are based in ${viewer.city}`,
    };
  }

  if (viewerCountry && viewerCountry === candidateCountry) {
    return {
      score: 65,
      reason: `Both founders are in ${viewer.country ?? candidate.country}`,
    };
  }

  return {
    score: 28,
    reason: "Founders are in different locations",
  };
}

const FACTOR_SCORERS: Record<
  CompatibilityFactorKey,
  (
    viewer: CompatibilityProfile,
    candidate: CompatibilityProfile,
  ) => Pick<CompatibilityFactorResult, "score" | "reason">
> = {
  complementaryRoles: scoreComplementaryRoles,
  buildingFocus: scoreBuildingFocus,
  stageSimilarity: scoreStageSimilarity,
  lookingForAlignment: scoreLookingForAlignment,
  locationProximity: scoreLocationProximity,
};

function buildFactorResults(
  viewer: CompatibilityProfile,
  candidate: CompatibilityProfile,
  weights: CompatibilityWeights,
): CompatibilityFactorResult[] {
  return (Object.keys(FACTOR_SCORERS) as CompatibilityFactorKey[]).map(
    (key) => {
      const { score, reason } = FACTOR_SCORERS[key](viewer, candidate);
      const weight = weights[key];
      const weightedScore = score * weight;

      return {
        key,
        label: COMPATIBILITY_FACTOR_LABELS[key],
        score,
        weight,
        weightedScore,
        matched: score >= COMPATIBILITY_MATCH_THRESHOLD,
        reason,
      };
    },
  );
}

function buildExplanation(factors: CompatibilityFactorResult[]): string {
  const highlights = factors
    .filter((factor) => factor.score >= COMPATIBILITY_MATCH_THRESHOLD)
    .sort((left, right) => right.weightedScore - left.weightedScore)
    .slice(0, 3)
    .map((factor) => factor.reason);

  if (highlights.length === 0) {
    return "Some overlap on journey stage and founder goals, with room to align further.";
  }

  return `${highlights.join(", ")}.`;
}

function buildTopReasons(factors: CompatibilityFactorResult[]): string[] {
  return factors
    .slice()
    .sort((left, right) => right.weightedScore - left.weightedScore)
    .filter((factor) => factor.score >= COMPATIBILITY_GAP_THRESHOLD)
    .slice(0, 2)
    .map((factor) => factor.reason);
}

export function createCompatibilityCache(): CompatibilityCache {
  return new Map();
}

export function getCompatibilityCacheKey(
  viewerId: string,
  candidateId: string,
): string {
  return `${viewerId}:${candidateId}`;
}

export function toCompatibilityProfile(input: {
  founderRole?: FounderRole | null;
  buildingFocus?: BuildingType | null;
  currentStage?: CurrentStage | null;
  lookingForRoles?: LookingForRole[] | null;
  country?: string | null;
  city?: string | null;
}): CompatibilityProfile | null {
  if (!input.founderRole || !input.buildingFocus || !input.currentStage) {
    return null;
  }

  return {
    founderRole: input.founderRole,
    buildingFocus: input.buildingFocus,
    currentStage: input.currentStage,
    lookingForRoles: input.lookingForRoles ?? [],
    country: input.country?.trim() || undefined,
    city: input.city?.trim() || undefined,
  };
}

export function calculateCompatibility(
  viewer: CompatibilityProfile,
  candidate: CompatibilityProfile,
  options?: {
    weights?: Partial<CompatibilityWeights>;
    cache?: CompatibilityCache;
    viewerId?: string;
    candidateId?: string;
  },
): CompatibilityResult {
  const cacheKey =
    options?.viewerId && options?.candidateId
      ? getCompatibilityCacheKey(options.viewerId, options.candidateId)
      : null;

  if (cacheKey && options?.cache?.has(cacheKey)) {
    return options.cache.get(cacheKey)!;
  }

  const weights = normalizeCompatibilityWeights(options?.weights);
  const factors = buildFactorResults(viewer, candidate, weights);
  const score = Math.round(
    factors.reduce((total, factor) => total + factor.weightedScore, 0),
  );

  const matchedFactors = factors
    .filter((factor) => factor.matched)
    .map((factor) => factor.label);

  const missingFactors = factors
    .filter((factor) => factor.score < COMPATIBILITY_GAP_THRESHOLD)
    .map((factor) => factor.label);

  const result: CompatibilityResult = {
    score,
    matchedFactors,
    missingFactors,
    explanation: buildExplanation(factors),
    topReasons: buildTopReasons(factors),
    factors,
  };

  if (cacheKey && options?.cache) {
    options.cache.set(cacheKey, result);
  }

  return result;
}
