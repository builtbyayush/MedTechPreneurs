import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import {
  calculateCompatibility,
  createCompatibilityCache,
  toCompatibilityProfile,
} from "@/lib/compatibility";
import { getActiveMatchedUserIds, tryCreateMutualMatch } from "@/lib/matching/queries";
import { formatLocation } from "@/lib/locations/format";
import { DiscoveryAction } from "@/models/DiscoveryAction";
import { User } from "@/models/User";
import type {
  DiscoveryFeedResponse,
  DiscoveryFounder,
  DiscoverySearchResult,
} from "@/types/discovery";
import type { DiscoveryActionResult } from "@/types/match";
import {
  BUILDING_TYPE_LABELS,
  CURRENT_STAGE_LABELS,
  FOUNDER_ROLES,
  FOUNDER_ROLE_LABELS,
  LOOKING_FOR_ROLE_LABELS,
  type BuildingType,
  type CurrentStage,
  type FounderRole,
  type LookingForRole,
} from "@/types/onboarding";
import { getFirstName } from "@/lib/user/display-name";

type DiscoveryCandidateFilter = Record<string, unknown>;

export type DiscoveryQueryOptions = {
  viewerId: string;
  /** Reserved for future ranking / category filters */
  limit?: number;
};

export function buildEligibleFounderFilter(
  viewerId: string,
  excludedIds: string[] = [],
): DiscoveryCandidateFilter {
  const excludedObjectIds = [viewerId, ...excludedIds]
    .filter(Boolean)
    .map((id) => new mongoose.Types.ObjectId(id));

  return {
    _id: { $nin: excludedObjectIds },
    onboardingCompleted: true,
    isActive: { $ne: false },
    founderRole: { $exists: true, $ne: null },
    buildingFocus: { $exists: true, $ne: null },
    currentStage: { $exists: true, $ne: null },
  };
}

function getCompatibilityPlaceholder(userId: string): number {
  let hash = 0;
  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash + userId.charCodeAt(index) * (index + 1)) % 97;
  }
  return 72 + (hash % 24);
}

function enrichFounderCompatibility(
  founder: Omit<
    DiscoveryFounder,
    "compatibilityScore" | "compatibilityReasons" | "compatibilityExplanation"
  >,
  viewerProfile: ReturnType<typeof toCompatibilityProfile>,
  candidateProfile: ReturnType<typeof toCompatibilityProfile>,
  cache: ReturnType<typeof createCompatibilityCache>,
  viewerId: string,
): DiscoveryFounder {
  if (!viewerProfile || !candidateProfile) {
    return {
      ...founder,
      compatibilityScore: getCompatibilityPlaceholder(founder.id),
      compatibilityReasons: [],
      compatibilityExplanation: "Complete your profile to unlock full compatibility scoring.",
    };
  }

  const compatibility = calculateCompatibility(viewerProfile, candidateProfile, {
    cache,
    viewerId,
    candidateId: founder.id,
  });

  return {
    ...founder,
    compatibilityScore: compatibility.score,
    compatibilityReasons: compatibility.topReasons,
    compatibilityExplanation: compatibility.explanation,
  };
}

function buildBioPlaceholder(
  name: string,
  buildingFocus: BuildingType,
  stage: CurrentStage,
): string {
  const firstName = getFirstName(name, name);
  return `${firstName} is building in ${BUILDING_TYPE_LABELS[buildingFocus].toLowerCase()} at the ${CURRENT_STAGE_LABELS[stage].toLowerCase()} stage and exploring the right co-founder fit.`;
}

function resolveBio(
  user: {
    name: string;
    bio?: string | null;
    buildingFocus: BuildingType;
    currentStage: CurrentStage;
  },
): string {
  if (user.bio?.trim()) {
    return user.bio.trim();
  }

  return buildBioPlaceholder(user.name, user.buildingFocus, user.currentStage);
}

export function serializeDiscoveryFounder(user: {
  _id: mongoose.Types.ObjectId;
  name: string;
  headline?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  yearsExperience?: number | null;
  companyName?: string | null;
  profilePhotoUrl?: string | null;
  founderRole?: FounderRole | null;
  buildingFocus?: BuildingType | null;
  currentStage?: CurrentStage | null;
  lookingForRoles?: LookingForRole[] | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  emailVerified?: boolean | null;
}): Omit<
  DiscoveryFounder,
  "compatibilityScore" | "compatibilityReasons" | "compatibilityExplanation"
> | null {
  if (!user.founderRole || !user.buildingFocus || !user.currentStage) {
    return null;
  }

  const id = user._id.toString();

  return {
    id,
    name: user.name,
    headline: user.headline?.trim() || undefined,
    founderRole: user.founderRole,
    buildingFocus: user.buildingFocus,
    currentStage: user.currentStage,
    lookingForRoles: user.lookingForRoles ?? [],
    location: formatLocation(user.city, user.state, user.country),
    bio: resolveBio({
      name: user.name,
      bio: user.bio,
      buildingFocus: user.buildingFocus,
      currentStage: user.currentStage,
    }),
    skills: user.skills ?? [],
    yearsExperience: user.yearsExperience ?? undefined,
    companyName: user.companyName?.trim() || undefined,
    profilePhotoUrl: user.profilePhotoUrl?.trim() || undefined,
    verified: Boolean(user.emailVerified),
  };
}

export async function getPassedFounderCount(viewerId: string): Promise<number> {
  await connectDB();

  return DiscoveryAction.countDocuments({
    viewerId,
    action: "pass",
  });
}

export async function resetPassedFounders(viewerId: string): Promise<number> {
  await connectDB();

  const result = await DiscoveryAction.deleteMany({
    viewerId,
    action: "pass",
  });

  return result.deletedCount ?? 0;
}

export async function getExcludedTargetIds(viewerId: string): Promise<string[]> {
  const [actedTargetIds, matchedUserIds] = await Promise.all([
    DiscoveryAction.find({ viewerId })
      .select("targetUserId")
      .lean<{ targetUserId: mongoose.Types.ObjectId }[]>()
      .then((actions) =>
        actions.map((action) => action.targetUserId.toString()),
      ),
    getActiveMatchedUserIds(viewerId),
  ]);

  return [...new Set([...actedTargetIds, ...matchedUserIds])];
}

export async function getDiscoveryFeed(
  options: DiscoveryQueryOptions,
): Promise<DiscoveryFeedResponse> {
  await connectDB();

  const compatibilityCache = createCompatibilityCache();
  const viewerUser = await User.findById(options.viewerId)
    .select("founderRole buildingFocus currentStage lookingForRoles country state city")
    .lean();
  const viewerProfile = toCompatibilityProfile(viewerUser ?? {});

  const excludedTargetIds = await getExcludedTargetIds(options.viewerId);
  const eligibleFilter = buildEligibleFounderFilter(options.viewerId);

  const eligibleCount = await User.countDocuments(eligibleFilter);

  if (eligibleCount === 0) {
    return { status: "empty", remainingCount: 0 };
  }

  const feedFilter = buildEligibleFounderFilter(
    options.viewerId,
    excludedTargetIds,
  );
  const remainingCount = await User.countDocuments(feedFilter);

  if (remainingCount === 0) {
    const passedCount = await getPassedFounderCount(options.viewerId);
    return { status: "no-more", remainingCount: 0, passedCount };
  }

  const nextUser = await User.findOne(feedFilter)
    .sort({ createdAt: -1 })
    .select(
      "name headline bio skills yearsExperience companyName profilePhotoUrl founderRole buildingFocus currentStage lookingForRoles country state city emailVerified createdAt",
    )
    .lean();

  if (!nextUser) {
    return { status: "no-more", remainingCount: 0 };
  }

  const baseFounder = serializeDiscoveryFounder(nextUser);

  if (!baseFounder) {
    return { status: "no-more", remainingCount: Math.max(remainingCount - 1, 0) };
  }

  const founder = enrichFounderCompatibility(
    baseFounder,
    viewerProfile,
    toCompatibilityProfile(nextUser),
    compatibilityCache,
    options.viewerId,
  );

  return {
    status: "founder",
    founder,
    remainingCount,
  };
}

export async function recordDiscoveryAction(input: {
  viewerId: string;
  targetUserId: string;
  action: "pass" | "connect";
}): Promise<DiscoveryActionResult> {
  await connectDB();

  if (input.viewerId === input.targetUserId) {
    throw new Error("Cannot act on your own profile");
  }

  const matchedUserIds = await getActiveMatchedUserIds(input.viewerId);
  if (matchedUserIds.includes(input.targetUserId)) {
    throw new Error("You are already matched with this founder");
  }

  const targetUser = await User.findOne({
    _id: input.targetUserId,
    ...buildEligibleFounderFilter(input.viewerId, matchedUserIds),
  })
    .select("_id")
    .lean();

  if (!targetUser) {
    throw new Error("Founder is no longer available");
  }

  await DiscoveryAction.findOneAndUpdate(
    {
      viewerId: input.viewerId,
      targetUserId: input.targetUserId,
    },
    {
      viewerId: input.viewerId,
      targetUserId: input.targetUserId,
      action: input.action,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  if (input.action === "pass") {
    return { action: "pass", matchCreated: false };
  }

  const matchResult = await tryCreateMutualMatch(input);

  return {
    action: "connect",
    matchCreated: matchResult.created,
    matchId: matchResult.matchId,
  };
}

export async function searchDiscoveryFounders(input: {
  viewerId: string;
  query: string;
  limit?: number;
}): Promise<DiscoverySearchResult[]> {
  await connectDB();

  const query = input.query.trim();
  if (query.length < 2) {
    return [];
  }

  const compatibilityCache = createCompatibilityCache();
  const viewerUser = await User.findById(input.viewerId)
    .select("founderRole buildingFocus currentStage lookingForRoles country state city")
    .lean();
  const viewerProfile = toCompatibilityProfile(viewerUser ?? {});

  const excludedTargetIds = await getExcludedTargetIds(input.viewerId);
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escapedQuery, "i");

  const matchingRoles = FOUNDER_ROLES.filter((role) =>
    FOUNDER_ROLE_LABELS[role].toLowerCase().includes(query.toLowerCase()),
  );

  const searchFilter = {
    ...buildEligibleFounderFilter(input.viewerId, excludedTargetIds),
    $or: [
      { name: regex },
      { companyName: regex },
      ...(matchingRoles.length > 0
        ? [{ founderRole: { $in: matchingRoles } }]
        : []),
    ],
  };

  const candidates = await User.find(searchFilter)
    .select(
      "name headline companyName founderRole buildingFocus currentStage lookingForRoles country state city",
    )
    .limit(input.limit ?? 8)
    .lean();

  return candidates.flatMap((candidate) => {
    if (!candidate.founderRole) {
      return [];
    }

    const candidateProfile = toCompatibilityProfile(candidate);
    const compatibility =
      viewerProfile && candidateProfile
        ? calculateCompatibility(viewerProfile, candidateProfile, {
            cache: compatibilityCache,
            viewerId: input.viewerId,
            candidateId: candidate._id.toString(),
          })
        : { score: 0 };

    return [
      {
        id: candidate._id.toString(),
        name: candidate.name,
        headline: candidate.headline?.trim() || undefined,
        founderRoleLabel: FOUNDER_ROLE_LABELS[candidate.founderRole as FounderRole],
        companyName: candidate.companyName?.trim() || undefined,
        compatibilityScore: compatibility.score,
      },
    ];
  });
}

export function getFounderRoleLabel(role: FounderRole): string {
  return FOUNDER_ROLE_LABELS[role];
}

export function getLookingForLabels(roles: LookingForRole[]): string {
  return roles.map((role) => LOOKING_FOR_ROLE_LABELS[role]).join(", ");
}
