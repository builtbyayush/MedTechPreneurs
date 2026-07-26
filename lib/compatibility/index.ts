export {
  calculateCompatibility,
  createCompatibilityCache,
  getCompatibilityCacheKey,
  toCompatibilityProfile,
} from "@/lib/compatibility/score";
export {
  COMPATIBILITY_FACTOR_LABELS,
  COMPATIBILITY_GAP_THRESHOLD,
  COMPATIBILITY_MATCH_THRESHOLD,
  DEFAULT_COMPATIBILITY_WEIGHTS,
  normalizeCompatibilityWeights,
} from "@/lib/compatibility/weights";
export type {
  CompatibilityCache,
  CompatibilityFactorKey,
  CompatibilityFactorResult,
  CompatibilityProfile,
  CompatibilityResult,
  CompatibilityWeights,
} from "@/lib/compatibility/types";
