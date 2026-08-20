import {
  BUILDING_TYPES,
  CURRENT_STAGES,
  FOUNDER_ROLES,
  LOOKING_FOR_ROLES,
  type BuildingType,
  type CurrentStage,
  type FounderRole,
  type LookingForRole,
} from "@/types/onboarding";
import type { UserCategory } from "@/types/user";

const ROLE_TO_CATEGORY: Record<FounderRole, UserCategory> = {
  doctor: "healthcare",
  researcher: "healthcare",
  engineer: "engineer",
  designer: "engineer",
  business: "entrepreneur",
  investor: "entrepreneur",
  student: "entrepreneur",
  other: "entrepreneur",
};

const LOOKING_ROLE_TO_CATEGORY: Record<LookingForRole, UserCategory> = {
  doctor: "healthcare",
  researcher: "healthcare",
  engineer: "engineer",
  designer: "engineer",
  business: "entrepreneur",
  investor: "entrepreneur",
  advisor: "entrepreneur",
};

export function mapFounderRoleToCategory(role: FounderRole): UserCategory {
  return ROLE_TO_CATEGORY[role];
}

export function mapLookingForRolesToCategories(
  roles: LookingForRole[],
): UserCategory[] {
  return [...new Set(roles.map((role) => LOOKING_ROLE_TO_CATEGORY[role]))];
}

/** Legacy `lookingFor` categories with own-category exclusion (PRD onboarding rule). */
export function buildLegacyLookingForCategories(
  lookingForRoles: LookingForRole[],
  ownFounderRole: FounderRole,
): UserCategory[] {
  const ownCategory = mapFounderRoleToCategory(ownFounderRole);
  const mapped = mapLookingForRolesToCategories(lookingForRoles);
  const excludingOwn = mapped.filter((category) => category !== ownCategory);
  return excludingOwn.length > 0 ? excludingOwn : mapped;
}

export function isValidFounderRole(value: string): value is FounderRole {
  return FOUNDER_ROLES.includes(value as FounderRole);
}

export function isValidBuildingType(value: string): value is BuildingType {
  return BUILDING_TYPES.includes(value as BuildingType);
}

export function isValidCurrentStage(value: string): value is CurrentStage {
  return CURRENT_STAGES.includes(value as CurrentStage);
}

export function isValidLookingForRole(value: string): value is LookingForRole {
  return LOOKING_FOR_ROLES.includes(value as LookingForRole);
}
