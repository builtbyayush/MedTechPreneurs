import mongoose from "mongoose";

import { INTRO_MESSAGE_MAX_LENGTH } from "@/constants/intro";
import { assertNotBlocked } from "@/lib/blocks/queries";
import { connectDB } from "@/lib/db";
import { DiscoveryAction } from "@/models/DiscoveryAction";
import { Conversation, getConversationParticipantKey } from "@/models/Conversation";
import { Message } from "@/models/Message";
import {
  getCanonicalMatchPair,
  Match,
} from "@/models/Match";
import { User } from "@/models/User";

export type SendIntroductionResult = {
  introSent: true;
  introSentAt: string;
  introPreview: string;
};

export class IntroductionError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "IntroductionError";
    this.status = status;
  }
}

/**
 * Persist the single allowed pre-match introduction for a Like/connect.
 * Enforced atomically via findOneAndUpdate — a second send is rejected.
 */
export async function sendIntroduction(input: {
  viewerId: string;
  targetUserId: string;
  content: string;
}): Promise<SendIntroductionResult> {
  await connectDB();

  const trimmed = input.content.trim();

  if (!trimmed) {
    throw new IntroductionError("Write a short introduction before sending.");
  }

  if (trimmed.length > INTRO_MESSAGE_MAX_LENGTH) {
    throw new IntroductionError(
      `Introduction must be ${INTRO_MESSAGE_MAX_LENGTH} characters or fewer`,
    );
  }

  if (input.viewerId === input.targetUserId) {
    throw new IntroductionError("You cannot introduce yourself to yourself.");
  }

  if (!mongoose.Types.ObjectId.isValid(input.targetUserId)) {
    throw new IntroductionError("Target profile no longer exists.", 404);
  }

  await assertNotBlocked(input.viewerId, input.targetUserId);

  const target = await User.findById(input.targetUserId).select("_id").lean();
  if (!target) {
    throw new IntroductionError("Target profile no longer exists.", 404);
  }

  const [userA, userB] = getCanonicalMatchPair(
    input.viewerId,
    input.targetUserId,
  );
  const mutualMatch = await Match.findOne({
    userA,
    userB,
    status: "matched",
  })
    .select("_id")
    .lean();

  if (mutualMatch) {
    throw new IntroductionError(
      "You're already connected. Continue the conversation in Messages.",
      409,
    );
  }

  const connectAction = await DiscoveryAction.findOne({
    viewerId: input.viewerId,
    targetUserId: input.targetUserId,
    action: "connect",
  })
    .select("introSentAt introMessage")
    .lean<{ introSentAt?: Date | null; introMessage?: string | null } | null>();

  if (!connectAction) {
    throw new IntroductionError(
      "Connect with this founder on Discover before sending an introduction.",
      403,
    );
  }

  if (connectAction.introSentAt) {
    throw new IntroductionError(
      "You've already sent your introduction for this connection.",
      409,
    );
  }

  const now = new Date();
  const updated = await DiscoveryAction.findOneAndUpdate(
    {
      viewerId: input.viewerId,
      targetUserId: input.targetUserId,
      action: "connect",
      $or: [{ introSentAt: { $exists: false } }, { introSentAt: null }],
    },
    {
      $set: {
        introMessage: trimmed,
        introSentAt: now,
      },
    },
    { returnDocument: "after" },
  ).select("introMessage introSentAt");

  if (!updated?.introSentAt) {
    // Race: another request won the update
    throw new IntroductionError(
      "You've already sent your introduction for this connection.",
      409,
    );
  }

  return {
    introSent: true,
    introSentAt: updated.introSentAt.toISOString(),
    introPreview: updated.introMessage ?? trimmed,
  };
}

/**
 * When a mutual match forms, copy any stored intros into the conversation
 * so they appear in full chat without unlocking chat early.
 */
export async function copyIntroductionsIntoConversation(input: {
  matchId: string;
  userIdA: string;
  userIdB: string;
}): Promise<void> {
  await connectDB();

  const participants = getCanonicalMatchPair(input.userIdA, input.userIdB);
  const participantKey = getConversationParticipantKey(
    input.userIdA,
    input.userIdB,
  );
  const conversation = await Conversation.findOne({
    $or: [{ participantKey }, { participants }],
  })
    .select("_id")
    .lean();

  if (!conversation) {
    return;
  }

  const existingCount = await Message.countDocuments({
    conversationId: conversation._id,
  });

  if (existingCount > 0) {
    return;
  }

  const intros = await DiscoveryAction.find({
    action: "connect",
    introSentAt: { $exists: true, $ne: null },
    introMessage: { $exists: true, $nin: [null, ""] },
    $or: [
      { viewerId: input.userIdA, targetUserId: input.userIdB },
      { viewerId: input.userIdB, targetUserId: input.userIdA },
    ],
  })
    .sort({ introSentAt: 1 })
    .select("viewerId introMessage introSentAt")
    .lean<
      {
        viewerId: mongoose.Types.ObjectId;
        introMessage?: string | null;
        introSentAt?: Date | null;
      }[]
    >();

  if (intros.length === 0) {
    return;
  }

  let lastContent = "";
  let lastAt = new Date();

  for (const intro of intros) {
    const content = intro.introMessage?.trim();
    if (!content || !intro.introSentAt) {
      continue;
    }

    await Message.create({
      conversationId: conversation._id,
      senderId: intro.viewerId,
      content,
      messageType: "text",
      isRead: false,
      createdAt: intro.introSentAt,
      updatedAt: intro.introSentAt,
    });

    lastContent = content;
    lastAt = intro.introSentAt;
  }

  if (lastContent) {
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: lastContent,
      lastMessageAt: lastAt,
    });

    await Match.findByIdAndUpdate(input.matchId, {
      lastActivityAt: lastAt,
    });
  }
}
