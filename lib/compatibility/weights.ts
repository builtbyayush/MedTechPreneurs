import type { CompatibilityFactorKey, CompatibilityWeights } from "@/lib/compatibility/types";

export const DEFAULT_COMPATIBILITY_WEIGHTS: CompatibilityWeights = {
  complementaryRoles: 0.3,
  buildingFocus: 0.25,
  stageSimilarity: 0.2,
  lookingForAlignment: 0.15,
  locationProximity: 0.1,
};

export const COMPATIBILITY_FACTOR_LABELS: Record<CompatibilityFactorKey, string> = {
  complementaryRoles: "Complementary founder roles",
  buildingFocus: "Building focus alignment",
  stageSimilarity: "Startup stage similarity",
  lookingForAlignment: "Looking-for alignment",
  locationProximity: "Location proximity",
};

/** Threshold above which a factor counts as a matched strength. */
export const COMPATIBILITY_MATCH_THRESHOLD = 70;

/** Threshold below which a factor is surfaced as a gap. */
export const COMPATIBILITY_GAP_THRESHOLD = 50;

export function normalizeCompatibilityWeights(
  weights: Partial<CompatibilityWeights> = {},
): CompatibilityWeights {
  const merged: CompatibilityWeights = {
    ...DEFAULT_COMPATIBILITY_WEIGHTS,
    ...weights,
  };

  const total = Object.values(merged).reduce((sum, weight) => sum + weight, 0);

  if (total <= 0) {
    return DEFAULT_COMPATIBILITY_WEIGHTS;
  }

  return Object.fromEntries(
    Object.entries(merged).map(([key, weight]) => [key, weight / total]),
  ) as CompatibilityWeights;
}
