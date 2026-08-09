import { hash } from "bcryptjs";

import { PROFILE_PHOTO_PLACEHOLDER } from "@/constants/profile";
import { connectDB, disconnectDB } from "@/lib/db";
import { seedReport } from "@/lib/reports/queries";
import {
  createSeedConnect,
  createSeedPass,
} from "@/lib/matching/queries";
import {
  backfillConversationsForMatchedUsers,
  createSeedMessage,
} from "@/lib/messaging/queries";
import {
  mapFounderRoleToCategory,
  mapLookingForRolesToCategories,
} from "@/lib/onboarding/mappers";
import { findStateForCityName } from "@/lib/locations/india";
import { Conversation } from "@/models/Conversation";
import { DiscoveryAction } from "@/models/DiscoveryAction";
import { EmailVerificationCode } from "@/models/EmailVerificationCode";
import { getCanonicalMatchPair } from "@/models/Match";
import { Match } from "@/models/Match";
import { Message } from "@/models/Message";
import { Report } from "@/models/Report";
import { User } from "@/models/User";

import {
  SEED_FOUNDERS,
  SEED_PASSWORD,
  SEED_RELATIONSHIPS,
  SEED_REPORTS,
} from "./seed-data";
import { SEED_MESSAGE_THREADS } from "./seed-messages-data";

const SEED_EMAIL_PATTERN = /@splice\.dev$/i;

type SeedSummary = {
  usersCreated: number;
  usersUpdated: number;
  discoveryActions: number;
  matches: number;
  conversations: number;
  messages: number;
  reports: number;
  elapsedMs: number;
};

function parseArgs(argv: string[]): { clear: boolean; purge: boolean } {
  return {
    clear: argv.includes("--clear"),
    purge: argv.includes("--purge"),
  };
}

/** Wipe every app collection — keeps only a clean slate for re-seeding. */
async function purgeAllData(): Promise<Record<string, number>> {
  const [
    messages,
    conversations,
    discoveryActions,
    matches,
    reports,
    verificationCodes,
    users,
  ] = await Promise.all([
    Message.deleteMany({}),
    Conversation.deleteMany({}),
    DiscoveryAction.deleteMany({}),
    Match.deleteMany({}),
    Report.deleteMany({}),
    EmailVerificationCode.deleteMany({}),
    User.deleteMany({}),
  ]);

  // Ensure Conversation indexes match the current schema (participantKey unique).
  await Conversation.syncIndexes();

  return {
    messages: messages.deletedCount ?? 0,
    conversations: conversations.deletedCount ?? 0,
    discoveryActions: discoveryActions.deletedCount ?? 0,
    matches: matches.deletedCount ?? 0,
    reports: reports.deletedCount ?? 0,
    verificationCodes: verificationCodes.deletedCount ?? 0,
    users: users.deletedCount ?? 0,
  };
}

async function clearSeedData(): Promise<number> {
  const seedUsers = await User.find({ email: SEED_EMAIL_PATTERN })
    .select("_id")
    .lean<{ _id: import("mongoose").Types.ObjectId }[]>();

  const seedUserIds = seedUsers.map((user) => user._id);

  if (seedUserIds.length === 0) {
    return 0;
  }

  const seedConversations = await Conversation.find({
    participants: { $in: seedUserIds },
  })
    .select("_id")
    .lean<{ _id: import("mongoose").Types.ObjectId }[]>();

  const conversationIds = seedConversations.map(
    (conversation) => conversation._id,
  );

  if (conversationIds.length > 0) {
    await Message.deleteMany({ conversationId: { $in: conversationIds } });
  }

  await Conversation.deleteMany({
    participants: { $in: seedUserIds },
  });

  await DiscoveryAction.deleteMany({
    $or: [
      { viewerId: { $in: seedUserIds } },
      { targetUserId: { $in: seedUserIds } },
    ],
  });

  await Match.deleteMany({
    $or: [{ userA: { $in: seedUserIds } }, { userB: { $in: seedUserIds } }],
  });

  await Report.deleteMany({
    $or: [
      { reporterId: { $in: seedUserIds } },
      { reportedUserId: { $in: seedUserIds } },
    ],
  });

  const result = await User.deleteMany({ _id: { $in: seedUserIds } });
  return result.deletedCount ?? 0;
}

async function seedUsers(): Promise<{ created: number; updated: number }> {
  const passwordHash = await hash(SEED_PASSWORD, 12);
  const now = new Date();
  let created = 0;
  let updated = 0;

  for (const founder of SEED_FOUNDERS) {
    const existing = await User.findOne({ email: founder.email.toLowerCase() })
      .select("_id")
      .lean();

    await User.findOneAndUpdate(
      { email: founder.email.toLowerCase() },
      {
        name: founder.name,
        email: founder.email.toLowerCase(),
        passwordHash,
        authProvider: "credentials",
        termsAcceptedAt: now,
        onboardingCompleted: true,
        onboardingCompletedAt: now,
        isActive: true,
        emailVerified: true,
        founderRole: founder.founderRole,
        buildingFocus: founder.buildingFocus,
        currentStage: founder.currentStage,
        lookingForRoles: founder.lookingForRoles,
        partnershipGoals: founder.partnershipGoals ?? ["finding-partnership"],
        country: founder.country,
        state: findStateForCityName(founder.city)?.name,
        city: founder.city,
        headline: founder.headline,
        bio: founder.bio,
        skills: founder.skills,
        yearsExperience: founder.yearsExperience,
        companyName: founder.companyName,
        linkedinUrl: founder.linkedinUrl,
        websiteUrl: founder.websiteUrl,
        profilePhotoUrl: founder.profilePhotoUrl ?? PROFILE_PHOTO_PLACEHOLDER,
        category: mapFounderRoleToCategory(founder.founderRole),
        lookingFor: mapLookingForRolesToCategories(founder.lookingForRoles),
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );

    if (existing) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  return { created, updated };
}

async function seedRelationships(): Promise<void> {
  const users = await User.find({ email: SEED_EMAIL_PATTERN })
    .select("_id email")
    .lean<{ _id: import("mongoose").Types.ObjectId; email: string }[]>();

  const idByEmail = new Map(
    users.map((user) => [user.email.toLowerCase(), user._id.toString()]),
  );

  for (const relationship of SEED_RELATIONSHIPS) {
    const fromId = idByEmail.get(relationship.from.toLowerCase());
    const toId = idByEmail.get(relationship.to.toLowerCase());

    if (!fromId || !toId) {
      console.warn(
        `[seed] Skipping relationship — missing user: ${relationship.from} -> ${relationship.to}`,
      );
      continue;
    }

    if (relationship.type === "pass") {
      await createSeedPass({ viewerId: fromId, targetUserId: toId });
      continue;
    }

    await createSeedConnect({
      viewerId: fromId,
      targetUserId: toId,
      introMessage: relationship.intro,
    });

    if (relationship.mutual) {
      await createSeedConnect({
        viewerId: toId,
        targetUserId: fromId,
        introMessage: relationship.introReply,
      });
    }
  }
}

async function seedMessages(): Promise<{ conversations: number; messages: number }> {
  const users = await User.find({ email: SEED_EMAIL_PATTERN })
    .select("_id email")
    .lean<{ _id: import("mongoose").Types.ObjectId; email: string }[]>();

  const seedUserIds = users.map((user) => user._id.toString());
  const idByEmail = new Map(
    users.map((user) => [user.email.toLowerCase(), user._id.toString()]),
  );

  await backfillConversationsForMatchedUsers(seedUserIds);

  let messagesCreated = 0;

  for (const thread of SEED_MESSAGE_THREADS) {
    const userA = idByEmail.get(thread.participantA.toLowerCase());
    const userB = idByEmail.get(thread.participantB.toLowerCase());

    if (!userA || !userB) {
      console.warn(
        `[seed] Skipping messages — missing user: ${thread.participantA} / ${thread.participantB}`,
      );
      continue;
    }

    const participants = getCanonicalMatchPair(userA, userB);
    const conversation = await Conversation.findOne({ participants })
      .select("_id")
      .lean();

    if (!conversation) {
      continue;
    }

    const existingCount = await Message.countDocuments({
      conversationId: conversation._id,
    });

    if (existingCount > 0) {
      continue;
    }

    const orderedMessages = [...thread.messages].sort(
      (left, right) => right.minutesAgo - left.minutesAgo,
    );

    for (const turn of orderedMessages) {
      const senderId = turn.from === "a" ? userA : userB;
      const createdAt = new Date(Date.now() - turn.minutesAgo * 60 * 1000);

      await createSeedMessage({
        conversationId: conversation._id.toString(),
        senderId,
        content: turn.content,
        createdAt,
      });
      messagesCreated += 1;
    }
  }

  const conversations = await Conversation.countDocuments({
    participants: { $in: users.map((user) => user._id) },
  });

  return { conversations, messages: messagesCreated };
}

async function seedReports(): Promise<void> {
  for (const report of SEED_REPORTS) {
    await seedReport({
      reporterEmail: report.reporter,
      reportedEmail: report.reported,
      reason: report.reason,
      description: report.description,
    });
  }
}

async function countSeedMetrics(): Promise<{
  discoveryActions: number;
  matches: number;
  conversations: number;
  messages: number;
  reports: number;
}> {
  const seedUsers = await User.find({ email: SEED_EMAIL_PATTERN })
    .select("_id")
    .lean<{ _id: import("mongoose").Types.ObjectId }[]>();

  const seedUserIds = seedUsers.map((user) => user._id);

  const seedConversations = await Conversation.find({
    participants: { $in: seedUserIds },
  })
    .select("_id")
    .lean<{ _id: import("mongoose").Types.ObjectId }[]>();

  const conversationIds = seedConversations.map(
    (conversation) => conversation._id,
  );

  const [discoveryActions, matches, messages, reports] = await Promise.all([
    DiscoveryAction.countDocuments({
      $or: [
        { viewerId: { $in: seedUserIds } },
        { targetUserId: { $in: seedUserIds } },
      ],
    }),
    Match.countDocuments({
      status: "matched",
      $or: [{ userA: { $in: seedUserIds } }, { userB: { $in: seedUserIds } }],
    }),
    conversationIds.length > 0
      ? Message.countDocuments({ conversationId: { $in: conversationIds } })
      : Promise.resolve(0),
    Report.countDocuments({
      $or: [
        { reporterId: { $in: seedUserIds } },
        { reportedUserId: { $in: seedUserIds } },
      ],
    }),
  ]);

  return {
    discoveryActions,
    matches,
    conversations: conversationIds.length,
    messages,
    reports,
  };
}

function printSummary(summary: SeedSummary): void {
  console.log("\nSplice seed complete\n");
  console.log(`Users created:       ${summary.usersCreated}`);
  console.log(`Users updated:       ${summary.usersUpdated}`);
  console.log(`Discovery actions:   ${summary.discoveryActions}`);
  console.log(`Matches created:     ${summary.matches}`);
  console.log(`Conversations:       ${summary.conversations}`);
  console.log(`Messages created:    ${summary.messages}`);
  console.log(`Reports stored:      ${summary.reports}`);
  console.log(`Time taken:          ${(summary.elapsedMs / 1000).toFixed(2)}s`);
  console.log("\nDemo login password for all @splice.dev accounts:");
  console.log(`  ${SEED_PASSWORD}\n`);
}

async function seedDashboardDemo(): Promise<void> {
  const users = await User.find({
    email: { $in: ["doctor@splice.dev", "engineer@splice.dev"] },
  })
    .select("_id email")
    .lean<{ _id: import("mongoose").Types.ObjectId; email: string }[]>();

  const idByEmail = new Map(
    users.map((user) => [user.email.toLowerCase(), user._id]),
  );

  const doctorId = idByEmail.get("doctor@splice.dev");
  const engineerId = idByEmail.get("engineer@splice.dev");

  if (!doctorId || !engineerId) {
    return;
  }

  const participants = getCanonicalMatchPair(
    doctorId.toString(),
    engineerId.toString(),
  );
  const conversation = await Conversation.findOne({ participants }).select("_id");

  if (conversation) {
    const latestInbound = await Message.find({
      conversationId: conversation._id,
      senderId: engineerId,
    })
      .sort({ createdAt: -1 })
      .limit(2)
      .select("_id")
      .lean<{ _id: import("mongoose").Types.ObjectId }[]>();

    if (latestInbound.length > 0) {
      await Message.updateMany(
        { _id: { $in: latestInbound.map((message) => message._id) } },
        { isRead: false },
      );
    }
  }

  await User.findByIdAndUpdate(doctorId, {
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
  });
}

async function main(): Promise<void> {
  const startedAt = Date.now();
  const { clear, purge } = parseArgs(process.argv.slice(2));

  await connectDB();

  if (purge) {
    const removed = await purgeAllData();
    console.log("Purged entire database:");
    for (const [collection, count] of Object.entries(removed)) {
      console.log(`  ${collection}: ${count}`);
    }
  } else if (clear) {
    const removed = await clearSeedData();
    console.log(`Cleared ${removed} existing @splice.dev seed users.`);
  }

  const { created, updated } = await seedUsers();
  await seedRelationships();
  const messageMetrics = await seedMessages();
  await seedDashboardDemo();
  await seedReports();
  const metrics = await countSeedMetrics();

  printSummary({
    usersCreated: created,
    usersUpdated: updated,
    discoveryActions: metrics.discoveryActions,
    matches: metrics.matches,
    conversations: metrics.conversations,
    messages: metrics.messages,
    reports: metrics.reports,
    elapsedMs: Date.now() - startedAt,
  });

  if (messageMetrics.messages === 0 && metrics.messages > 0) {
    console.log("Message threads already present — skipped duplicate seed inserts.");
  }

  await disconnectDB();
}

main().catch((error) => {
  console.error("[seed] Failed:", error);
  process.exit(1);
});
