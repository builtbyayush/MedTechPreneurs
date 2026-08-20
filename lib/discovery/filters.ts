import { FOUNDER_ROLES, FOUNDER_ROLE_LABELS, type FounderRole, type LookingForRole } from "@/types/onboarding";
import type { UserCategory } from "@/types/user";
import {
  mapFounderRoleToCategory,
  mapLookingForRolesToCategories,
} from "@/lib/onboarding/mappers";

export type DiscoveryFiltersInput = {
  query?: string;
  professions?: FounderRole[];
};

export type DiscoveryProfessionOption = {
  value: FounderRole;
  label: string;
};

export type ViewerDiscoveryContext = {
  allowedRoles: FounderRole[];
  professionOptions: DiscoveryProfessionOption[];
};

type ViewerDiscoveryFields = {
  lookingForRoles?: LookingForRole[] | null;
  lookingFor?: UserCategory[] | null;
};

export function resolveViewerDiscoveryContext(
  viewer: ViewerDiscoveryFields,
): ViewerDiscoveryContext {
  const categories =
    viewer.lookingFor && viewer.lookingFor.length > 0
      ? viewer.lookingFor
      : mapLookingForRolesToCategories(viewer.lookingForRoles ?? []);

  const allowedRoles = FOUNDER_ROLES.filter((role) =>
    categories.includes(mapFounderRoleToCategory(role)),
  );

  return {
    allowedRoles,
    professionOptions: allowedRoles.map((role) => ({
      value: role,
      label: FOUNDER_ROLE_LABELS[role],
    })),
  };
}

export function sanitizeProfessionFilters(
  requested: FounderRole[] | undefined,
  allowedRoles: FounderRole[],
): FounderRole[] {
  if (!requested?.length) {
    return [];
  }

  const allowed = new Set(allowedRoles);
  return [...new Set(requested.filter((role) => allowed.has(role)))];
}

export function hasActiveDiscoveryFilters(
  filters?: DiscoveryFiltersInput,
): boolean {
  const query = filters?.query?.trim() ?? "";
  return query.length >= 2 || Boolean(filters?.professions?.length);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildDiscoverySearchClause(query: string): Record<string, unknown> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return {};
  }

  const regex = new RegExp(escapeRegex(trimmed), "i");
  const matchingRoles = FOUNDER_ROLES.filter((role) =>
    FOUNDER_ROLE_LABELS[role].toLowerCase().includes(trimmed.toLowerCase()),
  );

  return {
    $or: [
      { name: regex },
      { companyName: regex },
      { headline: regex },
      { profession: regex },
      { specialisation: regex },
      { skills: regex },
      ...(matchingRoles.length > 0
        ? [{ founderRole: { $in: matchingRoles } }]
        : []),
    ],
  };
}

export function buildDiscoveryRoleClause(
  viewerContext: ViewerDiscoveryContext,
  filters?: DiscoveryFiltersInput,
): Record<string, unknown> {
  const selected = sanitizeProfessionFilters(
    filters?.professions,
    viewerContext.allowedRoles,
  );

  const roles =
    selected.length > 0 ? selected : viewerContext.allowedRoles;

  if (roles.length === 0) {
    return { founderRole: { $in: [] as FounderRole[] } };
  }

  return { founderRole: { $in: roles } };
}

export function buildDiscoveryFilterExtensions(
  viewerContext: ViewerDiscoveryContext,
  filters?: DiscoveryFiltersInput,
): Record<string, unknown>[] {
  const clauses: Record<string, unknown>[] = [
    buildDiscoveryRoleClause(viewerContext, filters),
  ];

  const query = filters?.query?.trim();
  if (query && query.length >= 2) {
    clauses.push(buildDiscoverySearchClause(query));
  }

  return clauses;
}

export function parseDiscoveryFiltersFromSearchParams(
  searchParams: URLSearchParams,
): DiscoveryFiltersInput {
  const q = searchParams.get("q")?.trim() || undefined;
  const repeated = searchParams.getAll("profession").filter(Boolean);
  const combined =
    searchParams
      .get("professions")
      ?.split(",")
      .map((value) => value.trim())
      .filter(Boolean) ?? [];

  const professions = [...new Set([...repeated, ...combined])].filter(
    (value): value is FounderRole =>
      FOUNDER_ROLES.includes(value as FounderRole),
  );

  return {
    ...(q ? { query: q } : {}),
    ...(professions.length > 0 ? { professions } : {}),
  };
}
