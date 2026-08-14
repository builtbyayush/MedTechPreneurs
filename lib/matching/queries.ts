import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import {
  getBlockedRelationshipUserIds,
  isBlockedBetween,
} from "@/lib/blocks/queries";
import {
  calculateCompatibility,
  createCompatibilityCache,
  toCompatibilityProfile,
} from "@/lib/compatibility";
import { ensureConversationForMatch, resolveConversationIdsForMatches } from "@/lib/messaging/queries";
import { copyIntroductionsIntoConversation } from "@/lib/matching/intro";
import {
  mapFounderRoleToCategory,
  mapLookingForRolesToCategories,
} from "@/lib/onboarding/mappers";
import { formatLocation } from "@/lib/locations/format";
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

  const blocked = await isBlockedBetween(input.viewerId, input.targetUserId);
  if (blocked) {
    return { created: false };
  }

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
    try {
      await ensureConversationForMatch({
        matchId: match._id.toString(),
        userIdA: input.viewerId,
        userIdB: input.targetUserId,
      });
      await copyIntroductionsIntoConversation({
        matchId: match._id.toString(),
        userIdA: input.viewerId,
        userIdB: input.targetUserId,
      });
    } catch (error) {
      console.error("[matching] Conversation setup failed after mutual match", {
        matchId: match._id.toString(),
        error,
      });
    }
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
  const [connectActions, blockedUserIds] = await Promise.all([
    DiscoveryAction.find({
      viewerId: userId,
      action: "connect",
    })
      .sort({ createdAt: -1 })
      .lean<
        {
          targetUserId: mongoose.Types.ObjectId;
          createdAt: Date;
          introMessage?: string | null;
          introSentAt?: Date | null;
        }[]
      >(),
    getBlockedRelationshipUserIds(userId),
  ]);

  if (connectActions.length === 0) {
    return [];
  }

  const blockedIds = new Set(blockedUserIds);
  const visibleConnectActions = connectActions.filter(
    (action) => !blockedIds.has(action.targetUserId.toString()),
  );

  if (visibleConnectActions.length === 0) {
    return [];
  }

  const targetObjectIds = visibleConnectActions.map(
    (action) => action.targetUserId,
  );

  const [targets, reciprocalConnects, matches] = await Promise.all([
    User.find({ _id: { $in: targetObjectIds } })
      .select(
        "name headline founderRole companyName city state country profilePhotoUrl",
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

  const conversationByMatchId = await resolveConversationIdsForMatches(matches);

  const targetMap = new Map(
    targets.map((target) => [target._id.toString(), target]),
  );

  return visibleConnectActions.flatMap((action) => {
    const targetId = action.targetUserId.toString();
    const target = targetMap.get(targetId);

    if (!target?.founderRole) {
      return [];
    }

    const matchInfo = matchByPartnerId.get(targetId);
    const status =
      matchInfo || reciprocalIds.has(targetId) ? "matched" : "pending";
    const introSent = Boolean(action.introSentAt);
    const introPreview = action.introMessage?.trim() || undefined;

    return [
      {
        targetUserId: targetId,
        connectedAt: action.createdAt.toISOString(),
        status,
        matchId: matchInfo?.matchId,
        matchedAt: matchInfo?.matchedAt,
        conversationId: matchInfo?.matchId
          ? conversationByMatchId.get(matchInfo.matchId)
          : undefined,
        introSent,
        introSentAt: action.introSentAt
          ? action.introSentAt.toISOString()
          : undefined,
        introPreview: introSent ? introPreview : undefined,
        partner: {
          id: targetId,
          name: target.name,
          headline: target.headline ?? undefined,
          founderRole: target.founderRole as FounderRole,
          companyName: target.companyName ?? undefined,
          location: formatLocation(target.city, target.state, target.country),
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
  const [matches, blockedUserIds] = await Promise.all([
    Match.find({
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
      >(),
    getBlockedRelationshipUserIds(userId),
  ]);

  if (matches.length === 0) {
    return [];
  }

  const blockedIds = new Set(blockedUserIds);
  const visibleMatches = matches.filter(
    (match) => !blockedIds.has(getMatchPartnerId(match, userId)),
  );

  if (visibleMatches.length === 0) {
    return [];
  }

  const viewerUser = await User.findById(userId)
    .select("founderRole buildingFocus currentStage lookingForRoles country state city")
    .lean();
  const viewerProfile = toCompatibilityProfile(viewerUser ?? {});
  const compatibilityCache = createCompatibilityCache();

  const partnerIds = visibleMatches.map((match) =>
    getMatchPartnerId(match, userId),
  );
  const partners = await User.find({ _id: { $in: partnerIds } })
    .select(
      "name headline founderRole companyName city state country profilePhotoUrl buildingFocus currentStage lookingForRoles",
    )
    .lean();

  const partnerMap = new Map(
    partners.map((partner) => [partner._id.toString(), partner]),
  );

  const conversationByMatchId =
    await resolveConversationIdsForMatches(visibleMatches);

  return visibleMatches.flatMap((match) => {
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
        conversationId: conversationByMatchId.get(match._id.toString()),
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
          location: formatLocation(partner.city, partner.state, partner.country),
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
    await copyIntroductionsIntoConversation({
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
  introMessage?: string;
  introSentAt?: Date;
}): Promise<void> {
  await connectDB();

  const introMessage = input.introMessage?.trim();
  const introSentAt =
    introMessage && introMessage.length > 0
      ? (input.introSentAt ?? new Date())
      : undefined;

  await DiscoveryAction.findOneAndUpdate(
    { viewerId: input.viewerId, targetUserId: input.targetUserId },
    {
      viewerId: input.viewerId,
      targetUserId: input.targetUserId,
      action: "connect",
      ...(introMessage && introSentAt
        ? { introMessage, introSentAt }
        : {}),
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
