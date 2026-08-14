import mongoose from "mongoose";

import { conversationRoute, ROUTES } from "@/constants/routes";
import { isProfilePhotoPlaceholder } from "@/constants/profile";
import {
  calculateCompatibility,
  createCompatibilityCache,
  toCompatibilityProfile,
} from "@/lib/compatibility";
import { connectDB } from "@/lib/db";
import { getBlockedRelationshipUserIds } from "@/lib/blocks/queries";
import {
  buildEligibleFounderFilter,
  getExcludedTargetIds,
} from "@/lib/discovery/queries";
import { calculateProfileCompletion } from "@/lib/home/profile-completion";
import { getActiveMatchedUserIds } from "@/lib/matching/queries";
import { getGreetingName } from "@/lib/user/display-name";
import { getConversationPartnerId, Conversation } from "@/models/Conversation";
import { DiscoveryAction } from "@/models/DiscoveryAction";
import { Message } from "@/models/Message";
import { User } from "@/models/User";
import type { HomeActivityItem, HomeDashboardData } from "@/types/home";
import {
  BUILDING_TYPE_LABELS,
  CURRENT_STAGE_LABELS,
  FOUNDER_ROLE_LABELS,
  type FounderRole,
} from "@/types/onboarding";
import { getMatchPartnerId, Match } from "@/models/Match";

function serializePartnerPhoto(url?: string | null): string | undefined {
  const normalized = url?.trim();
  if (!normalized || isProfilePhotoPlaceholder(normalized)) {
    return undefined;
  }
  return normalized;
}

export async function getHomeDashboard(userId: string): Promise<HomeDashboardData> {
  await connectDB();

  const viewerObjectId = new mongoose.Types.ObjectId(userId);

  const [
    viewer,
    matchedUserIds,
    excludedTargetIds,
    blockedUserIds,
    recentMatches,
    recentActions,
    conversations,
  ] = await Promise.all([
    User.findById(userId)
      .select(
        "name companyName profilePhotoUrl headline bio skills linkedinUrl websiteUrl founderRole buildingFocus currentStage lookingForRoles country city updatedAt onboardingCompletedAt",
      )
      .lean(),
    getActiveMatchedUserIds(userId),
    getExcludedTargetIds(userId),
    getBlockedRelationshipUserIds(userId),
    Match.find({
      status: "matched",
      $or: [{ userA: viewerObjectId }, { userB: viewerObjectId }],
    })
      .sort({ matchedAt: -1, createdAt: -1 })
      .limit(5)
      .lean<
        {
          _id: mongoose.Types.ObjectId;
          userA: mongoose.Types.ObjectId;
          userB: mongoose.Types.ObjectId;
          matchedAt?: Date | null;
          createdAt: Date;
        }[]
      >(),
    DiscoveryAction.find({ viewerId: viewerObjectId })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean<
        {
          targetUserId: mongoose.Types.ObjectId;
          action: "pass" | "connect";
          createdAt: Date;
        }[]
      >(),
    Conversation.find({ participants: viewerObjectId })
      .sort({ lastMessageAt: -1 })
      .lean<
        {
          _id: mongoose.Types.ObjectId;
          matchId: mongoose.Types.ObjectId;
          participants: mongoose.Types.ObjectId[];
          lastMessage?: string | null;
          lastMessageAt?: Date | null;
        }[]
      >(),
  ]);

  if (!viewer) {
    throw new Error("User not found");
  }

  const blockedPartnerIds = new Set(blockedUserIds);

  const visibleRecentMatches = recentMatches.filter(
    (match) => !blockedPartnerIds.has(getMatchPartnerId(match, userId)),
  );
  const visibleConversations = conversations.filter((conversation) => {
    const partnerId = getConversationPartnerId(conversation, userId);
    return !blockedPartnerIds.has(partnerId);
  });
  const visibleRecentActions = recentActions.filter(
    (action) => !blockedPartnerIds.has(action.targetUserId.toString()),
  );

  const matchPartnerIds = visibleRecentMatches.map((match) =>
    getMatchPartnerId(match, userId),
  );
  const conversationIds = visibleConversations.map(
    (conversation) => conversation._id,
  );
  const matchIds = visibleRecentMatches.map((match) => match._id);
  const conversationPartnerIds = visibleConversations.map((conversation) =>
    getConversationPartnerId(conversation, userId),
  );

  const connectActions = visibleRecentActions.filter(
    (action) => action.action === "connect",
  );
  const connectTargetIds = connectActions.map((action) =>
    action.targetUserId.toString(),
  );

  const [
    matchPartners,
    matchConversations,
    unreadByConversation,
    suggestedCandidates,
    connectUsers,
    conversationPartners,
    recentInboundMessages,
  ] = await Promise.all([
    matchPartnerIds.length
      ? User.find({ _id: { $in: matchPartnerIds } })
          .select(
            "name founderRole profilePhotoUrl buildingFocus currentStage lookingForRoles country city",
          )
          .lean()
      : Promise.resolve([]),
    matchIds.length
      ? Conversation.find({ matchId: { $in: matchIds } })
          .select("_id matchId")
          .lean()
      : Promise.resolve([]),
    conversationIds.length
      ? Message.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
          {
            $match: {
              conversationId: { $in: conversationIds },
              senderId: { $ne: viewerObjectId },
              isRead: false,
            },
          },
          { $group: { _id: "$conversationId", count: { $sum: 1 } } },
        ])
      : Promise.resolve([]),
    User.find(buildEligibleFounderFilter(userId, excludedTargetIds))
      .select(
        "name headline founderRole companyName profilePhotoUrl buildingFocus currentStage lookingForRoles country city",
      )
      .limit(24)
      .lean(),
    connectTargetIds.length
      ? User.find({ _id: { $in: connectTargetIds } })
          .select("name")
          .lean()
      : Promise.resolve([]),
    conversationPartnerIds.length
      ? User.find({ _id: { $in: conversationPartnerIds } })
          .select("name profilePhotoUrl")
          .lean()
      : Promise.resolve([]),
    conversationIds.length
      ? Message.find({
          conversationId: { $in: conversationIds },
          senderId: { $ne: viewerObjectId },
        })
          .sort({ createdAt: -1 })
          .limit(8)
          .select("conversationId senderId createdAt")
          .lean()
      : Promise.resolve([]),
  ]);

  const viewerProfile = toCompatibilityProfile(viewer);
  const compatibilityCache = createCompatibilityCache();
  const firstName = getGreetingName(viewer.name);
  const profileCompletion = calculateProfileCompletion(viewer);

  const partnerMap = new Map(
    matchPartners.map((partner) => [partner._id.toString(), partner]),
  );
  const conversationByMatchId = new Map(
    matchConversations.map((conversation) => [
      conversation.matchId.toString(),
      conversation._id.toString(),
    ]),
  );
  const unreadMap = new Map(
    unreadByConversation.map((entry) => [entry._id.toString(), entry.count]),
  );
  const connectUserMap = new Map(
    connectUsers.map((user) => [user._id.toString(), user.name]),
  );
  const conversationPartnerMap = new Map(
    conversationPartners.map((partner) => [partner._id.toString(), partner]),
  );

  const recentMatchesData = visibleRecentMatches.flatMap((match) => {
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
        : { score: 0 };

    return [
      {
        matchId: match._id.toString(),
        conversationId: conversationByMatchId.get(match._id.toString()),
        matchedAt: (match.matchedAt ?? match.createdAt).toISOString(),
        compatibilityScore: compatibility.score,
        partner: {
          id: partnerId,
          name: partner.name,
          founderRoleLabel: FOUNDER_ROLE_LABELS[partner.founderRole as FounderRole],
          profilePhotoUrl: serializePartnerPhoto(partner.profilePhotoUrl),
        },
      },
    ];
  });

  const unreadMessages = visibleConversations
    .flatMap((conversation) => {
      const unreadCount = unreadMap.get(conversation._id.toString()) ?? 0;

      if (unreadCount === 0) {
        return [];
      }

      const partnerId = getConversationPartnerId(conversation, userId);
      const partner = conversationPartnerMap.get(partnerId);

      if (!partner) {
        return [];
      }

      return [
        {
          conversationId: conversation._id.toString(),
          unreadCount,
          lastMessage:
            conversation.lastMessage?.trim() || "New messages waiting",
          lastMessageAt: (
            conversation.lastMessageAt ?? new Date()
          ).toISOString(),
          partner: {
            id: partnerId,
            name: partner.name,
            profilePhotoUrl: serializePartnerPhoto(partner.profilePhotoUrl),
          },
        },
      ];
    })
    .slice(0, 5);

  const suggestedFounders = suggestedCandidates
    .flatMap((candidate) => {
      const candidateProfile = toCompatibilityProfile(candidate);

      if (!viewerProfile || !candidateProfile || !candidate.founderRole) {
        return [];
      }

      const compatibility = calculateCompatibility(
        viewerProfile,
        candidateProfile,
        {
          cache: compatibilityCache,
          viewerId: userId,
          candidateId: candidate._id.toString(),
        },
      );

      return [
        {
          id: candidate._id.toString(),
          name: candidate.name,
          headline: candidate.headline?.trim() || undefined,
          founderRoleLabel:
            FOUNDER_ROLE_LABELS[candidate.founderRole as FounderRole],
          companyName: candidate.companyName?.trim() || undefined,
          profilePhotoUrl: serializePartnerPhoto(candidate.profilePhotoUrl),
          compatibilityScore: compatibility.score,
          compatibilityReasons: compatibility.topReasons,
        },
      ];
    })
    .sort((left, right) => right.compatibilityScore - left.compatibilityScore)
    .slice(0, 3);

  const matchedPartnerIdSet = new Set(matchedUserIds);
  const activityEvents: HomeActivityItem[] = [];

  for (const match of visibleRecentMatches.slice(0, 5)) {
    const partnerId = getMatchPartnerId(match, userId);
    const partner = partnerMap.get(partnerId);

    if (!partner) {
      continue;
    }

    activityEvents.push({
      id: `match-${match._id.toString()}`,
      type: "match",
      message: `You matched with ${partner.name}`,
      occurredAt: (match.matchedAt ?? match.createdAt).toISOString(),
      href: conversationByMatchId.get(match._id.toString())
        ? conversationRoute(conversationByMatchId.get(match._id.toString())!)
        : ROUTES.app.matches,
    });
  }

  for (const action of connectActions.slice(0, 5)) {
    const targetId = action.targetUserId.toString();

    if (matchedPartnerIdSet.has(targetId)) {
      continue;
    }

    const targetName = connectUserMap.get(targetId);
    if (!targetName) {
      continue;
    }

    activityEvents.push({
      id: `connect-${targetId}-${action.createdAt.getTime()}`,
      type: "connect",
      message: `You connected with ${targetName}`,
      occurredAt: action.createdAt.toISOString(),
      href: ROUTES.app.discover,
    });
  }

  for (const message of recentInboundMessages) {
    const partnerId = message.senderId.toString();
    const partner = conversationPartnerMap.get(partnerId);

    if (!partner) {
      continue;
    }

    activityEvents.push({
      id: `message-${message._id.toString()}`,
      type: "message",
      message: `${partner.name} sent a message`,
      occurredAt: message.createdAt.toISOString(),
      href: conversationRoute(message.conversationId.toString()),
    });
  }

  if (
    viewer.updatedAt &&
    viewer.onboardingCompletedAt &&
    viewer.updatedAt.getTime() > viewer.onboardingCompletedAt.getTime() + 60_000
  ) {
    activityEvents.push({
      id: `profile-${viewer.updatedAt.getTime()}`,
      type: "profile",
      message: "Profile updated",
      occurredAt: viewer.updatedAt.toISOString(),
      href: ROUTES.app.profile,
    });
  }

  const recentActivity = activityEvents
    .sort(
      (left, right) =>
        new Date(right.occurredAt).getTime() -
        new Date(left.occurredAt).getTime(),
    )
    .slice(0, 8);

  const topSuggested = suggestedFounders[0];
  const compatibilityInsight = topSuggested
    ? {
        headline: `${topSuggested.compatibilityScore}% fit with ${topSuggested.name}`,
        detail:
          topSuggested.compatibilityReasons[0] ??
          "Strong overlap across role, stage, and building focus.",
        topScore: topSuggested.compatibilityScore,
      }
    : {
        headline: "Keep discovering founders",
        detail:
          "Complete your profile and browse Discover to unlock sharper compatibility insights.",
      };

  return {
    welcome: {
      firstName,
      founderRoleLabel: viewer.founderRole
        ? FOUNDER_ROLE_LABELS[viewer.founderRole as FounderRole]
        : "Founder",
      buildingFocusLabel: viewer.buildingFocus
        ? BUILDING_TYPE_LABELS[viewer.buildingFocus]
        : "Healthcare",
      currentStageLabel: viewer.currentStage
        ? CURRENT_STAGE_LABELS[viewer.currentStage]
        : "Startup",
      companyName: viewer.companyName?.trim() || undefined,
    },
    profileCompletion,
    compatibilityInsight,
    recentMatches: recentMatchesData,
    unreadMessages,
    suggestedFounders,
    recentActivity,
    quickActions: [
      {
        label: "Discover founders",
        description: "Browse your next co-founder match",
        href: ROUTES.app.discover,
      },
      {
        label: "View matches",
        description: "See who connected back",
        href: ROUTES.app.matches,
      },
      {
        label: "Open messages",
        description: "Continue matched conversations",
        href: ROUTES.app.messages,
      },
      {
        label: "Edit profile",
        description: "Improve compatibility accuracy",
        href: ROUTES.app.profile,
      },
      {
        label: "Founder's toolkit",
        description: "Regulatory, fundraising, and ops resources",
        href: ROUTES.app.toolkit,
      },
    ],
  };
}
