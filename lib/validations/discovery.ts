import { z } from "zod";

import { DISCOVERY_ACTIONS } from "@/models/DiscoveryAction";
import { FOUNDER_ROLES } from "@/types/onboarding";

export const discoveryActionSchema = z.object({
  targetUserId: z.string().min(1, "Founder id is required"),
  action: z.enum(DISCOVERY_ACTIONS, {
    message: "Action must be pass or connect",
  }),
});

export type DiscoveryActionInput = z.infer<typeof discoveryActionSchema>;

export const discoverySearchSchema = z.object({
  q: z.string().trim().min(2, "Enter at least 2 characters").max(80),
});

const professionEnum = z.enum(FOUNDER_ROLES);

export const discoveryFiltersSchema = z.object({
  q: z
    .string()
    .trim()
    .max(80)
    .optional()
    .refine((value) => !value || value.length >= 2, {
      message: "Enter at least 2 characters to search",
    }),
  profession: z
    .union([professionEnum, z.array(professionEnum)])
    .optional()
    .transform((value) => {
      if (!value) {
        return undefined;
      }

      return Array.isArray(value) ? [...new Set(value)] : [value];
    }),
});

export type DiscoveryFiltersQuery = z.infer<typeof discoveryFiltersSchema>;

export function parseDiscoveryFiltersQuery(
  searchParams: URLSearchParams,
): DiscoveryFiltersQuery {
  const professions = [
    ...searchParams.getAll("profession"),
    ...(searchParams.get("professions")?.split(",").map((value) => value.trim()) ??
      []),
  ].filter(Boolean);

  const parsed = discoveryFiltersSchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    profession: professions.length > 0 ? professions : undefined,
  });

  if (!parsed.success) {
    throw parsed.error;
  }

  return parsed.data;
}
