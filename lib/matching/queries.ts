import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import {
  calculateCompatibility,
  createCompatibilityCache,
  toCompatibilityProfile,
} from "@/lib/compatibility";
import { ensureConversationForMatch } from "@/lib/messaging/queries";
import {
  mapFounderRoleToCategory,
  mapLookingForRolesToCategories,
} from "@/lib/onboarding/mappers";
import { DiscoveryAction } from "@/models/DiscoveryAction";
import {
  getCanonicalMatchPair,
  getMatchPartnerId,
  Match,
} from "@/models/Match";
import type { MatchListItem, OutgoingConnectListItem } from "@/types/match";
import {
  FOUNDER_ROLE_LABELS,
  type FounderRole,
} from "@/types/onboarding";
import { User } from "@/models/User";

const ACTIVE_MATCH_STATUSES = ["pending", "matched"] as const;

function formatLocation(city?: string | null, country?: string | null): string {
  return [city, country].filter(Boolean).join(", ") || "Location not shared";
}

export async function getActiveMatchedUserIds(userId: string): Promise<string[]> {
  await connectDB();

  const viewerObjectId = new mongoose.Types.ObjectId(userId);
  const matches = await Match.find({
    status: { $in: ACTIVE_MATCH_STATUSES },
    $or: [{ userA: viewerObjectId }, { userB: viewerObjectId }],
  })
    .select("userA userB")
    .lean<{ userA: mongoose.Types.ObjectId; userB: mongoose.Types.ObjectId }[]>();

  return matches.map((match) => getMatchPartnerId(match, userId));
}

export async function tryCreateMutualMatch(input: {
  viewerId: string;
  targetUserId: string;
}): Promise<{ created: boolean; matchId?: string }> {
  await connectDB();

  const reciprocalConnect = await DiscoveryAction.findOne({
    viewerId: input.targetUserId,
    targetUserId: input.viewerId,
    action: "connect",
  }).lean();

  if (!reciprocalConnect) {
    return { created: false };
  }

  const [userA, userB] = getCanonicalMatchPair(input.viewerId, input.targetUserId);
  const now = new Date();

  const match = await Match.findOneAndUpdate(
    { userA, userB },
    {
      userA,
      userB,
      status: "matched",
      matchedAt: now,
      lastActivityAt: now,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  ).select("_id");

  if (match?._id) {
    await ensureConversationForMatch({
      matchId: match._id.toString(),
      userIdA: input.viewerId,
      userIdB: input.targetUserId,
    });
  }

  return {
    created: true,
    matchId: match?._id.toString(),
  };
}

export async function getOutgoingConnectsForUser(
  userId: string,
): Promise<OutgoingConnectListItem[]> {
  await connectDB();

  const viewerObjectId = new mongoose.Types.ObjectId(userId);
  const connectActions = await DiscoveryAction.find({
    viewerId: userId,
    action: "connect",
  })
    .sort({ createdAt: -1 })
    .lean<
      {
        targetUserId: mongoose.Types.ObjectId;
        createdAt: Date;
      }[]
    >();

  if (connectActions.length === 0) {
    return [];
  }

  const targetObjectIds = connectActions.map((action) => action.targetUserId);

  const [targets, reciprocalConnects, matches] = await Promise.all([
    User.find({ _id: { $in: targetObjectIds } })
      .select(
        "name headline founderRole companyName city country profilePhotoUrl",
      )
      .lean(),
    DiscoveryAction.find({
      viewerId: { $in: targetObjectIds },
      targetUserId: viewerObjectId,
      action: "connect",
    })
      .select("viewerId")
      .lean<{ viewerId: mongoose.Types.ObjectId }[]>(),
    Match.find({
      status: "matched",
      $or: [
        { userA: viewerObjectId, userB: { $in: targetObjectIds } },
        { userB: viewerObjectId, userA: { $in: targetObjectIds } },
      ],
    })
      .select("userA userB _id matchedAt createdAt")
      .lean<
        {
          _id: mongoose.Types.ObjectId;
          userA: mongoose.Types.ObjectId;
          userB: mongoose.Types.ObjectId;
          matchedAt?: Date | null;
          createdAt: Date;
        }[]
      >(),
  ]);

  const reciprocalIds = new Set(
    reciprocalConnects.map((action) => action.viewerId.toString()),
  );
  const matchByPartnerId = new Map<
    string,
    { matchId: string; matchedAt: string }
  >();

  for (const match of matches) {
    const partnerId = getMatchPartnerId(match, userId);
    matchByPartnerId.set(partnerId, {
      matchId: match._id.toString(),
      matchedAt: (match.matchedAt ?? match.createdAt).toISOString(),
    });
  }

  const targetMap = new Map(
    targets.map((target) => [target._id.toString(), target]),
  );

  return connectActions.flatMap((action) => {
    const targetId = action.targetUserId.toString();
    const target = targetMap.get(targetId);

    if (!target?.founderRole) {
      return [];
    }

    const matchInfo = matchByPartnerId.get(targetId);
    const status =
      matchInfo || reciprocalIds.has(targetId) ? "matched" : "pending";

    return [
      {
        targetUserId: targetId,
        connectedAt: action.createdAt.toISOString(),
        status,
        matchId: matchInfo?.matchId,
        matchedAt: matchInfo?.matchedAt,
        partner: {
          id: targetId,
          name: target.name,
          headline: target.headline ?? undefined,
          founderRole: target.founderRole as FounderRole,
          companyName: target.companyName ?? undefined,
          location: formatLocation(target.city, target.country),
          profilePhotoUrl: target.profilePhotoUrl ?? undefined,
        },
      },
    ];
  });
}

export async function getMatchedFoundersForUser(
  userId: string,
): Promise<MatchListItem[]> {
  await connectDB();

  const viewerObjectId = new mongoose.Types.ObjectId(userId);
  const matches = await Match.find({
    status: "matched",
    $or: [{ userA: viewerObjectId }, { userB: viewerObjectId }],
  })
    .sort({ matchedAt: -1, createdAt: -1 })
    .lean<
      {
        _id: mongoose.Types.ObjectId;
        userA: mongoose.Types.ObjectId;
        userB: mongoose.Types.ObjectId;
        matchedAt?: Date | null;
        createdAt: Date;
      }[]
    >();

  if (matches.length === 0) {
    return [];
  }

  const viewerUser = await User.findById(userId)
    .select("founderRole buildingFocus currentStage lookingForRoles country city")
    .lean();
  const viewerProfile = toCompatibilityProfile(viewerUser ?? {});
  const compatibilityCache = createCompatibilityCache();

  const partnerIds = matches.map((match) => getMatchPartnerId(match, userId));
  const partners = await User.find({ _id: { $in: partnerIds } })
    .select(
      "name headline founderRole companyName city country profilePhotoUrl buildingFocus currentStage lookingForRoles",
    )
    .lean();

  const partnerMap = new Map(
    partners.map((partner) => [partner._id.toString(), partner]),
  );

  return matches.flatMap((match) => {
    const partnerId = getMatchPartnerId(match, userId);
    const partner = partnerMap.get(partnerId);

    if (!partner?.founderRole) {
      return [];
    }

    const partnerProfile = toCompatibilityProfile(partner);
    const compatibility =
      viewerProfile && partnerProfile
        ? calculateCompatibility(viewerProfile, partnerProfile, {
            cache: compatibilityCache,
            viewerId: userId,
            candidateId: partnerId,
          })
        : {
            score: 0,
            explanation: "Complete your profile to unlock compatibility scoring.",
            topReasons: [] as string[],
          };

    return [
      {
        matchId: match._id.toString(),
        matchedAt: (match.matchedAt ?? match.createdAt).toISOString(),
        compatibilityScore: compatibility.score,
        compatibilityExplanation: compatibility.explanation,
        compatibilityReasons: compatibility.topReasons,
        partner: {
          id: partnerId,
          name: partner.name,
          headline: partner.headline ?? undefined,
          founderRole: partner.founderRole as FounderRole,
          companyName: partner.companyName ?? undefined,
          location: formatLocation(partner.city, partner.country),
          profilePhotoUrl: partner.profilePhotoUrl ?? undefined,
        },
      } satisfies MatchListItem,
    ];
  });
}

export async function createSeedMatch(input: {
  userIdA: string;
  userIdB: string;
  status?: "pending" | "matched" | "archived";
  matchedAt?: Date;
}): Promise<string> {
  await connectDB();

  const [userA, userB] = getCanonicalMatchPair(input.userIdA, input.userIdB);
  const now = input.matchedAt ?? new Date();

  const match = await Match.findOneAndUpdate(
    { userA, userB },
    {
      userA,
      userB,
      status: input.status ?? "matched",
      matchedAt: input.status === "matched" ? now : undefined,
      lastActivityAt: now,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  if ((input.status ?? "matched") === "matched") {
    await ensureConversationForMatch({
      matchId: match._id.toString(),
      userIdA: input.userIdA,
      userIdB: input.userIdB,
    });
  }

  return match._id.toString();
}

export async function createSeedConnect(input: {
  viewerId: string;
  targetUserId: string;
}): Promise<void> {
  await connectDB();

  await DiscoveryAction.findOneAndUpdate(
    { viewerId: input.viewerId, targetUserId: input.targetUserId },
    {
      viewerId: input.viewerId,
      targetUserId: input.targetUserId,
      action: "connect",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  await tryCreateMutualMatch(input);
}

export async function createSeedPass(input: {
  viewerId: string;
  targetUserId: string;
}): Promise<void> {
  await connectDB();

  await DiscoveryAction.findOneAndUpdate(
    { viewerId: input.viewerId, targetUserId: input.targetUserId },
    {
      viewerId: input.viewerId,
      targetUserId: input.targetUserId,
      action: "pass",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
}

export function getFounderRoleLabel(role: FounderRole): string {
  return FOUNDER_ROLE_LABELS[role];
}

export { mapFounderRoleToCategory, mapLookingForRolesToCategories };
