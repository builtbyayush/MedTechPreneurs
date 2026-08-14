import mongoose from "mongoose";

import { isProfilePhotoPlaceholder } from "@/constants/profile";
import {
  getBlockedRelationshipUserIds,
  isBlockedBetween,
} from "@/lib/blocks/queries";
import { connectDB } from "@/lib/db";
import { MESSAGE_DUPLICATE_WINDOW_MS } from "@/lib/messaging/constants";
import {
  Conversation,
  getConversationParticipantKey,
  getConversationPartnerId,
} from "@/models/Conversation";
import { Message } from "@/models/Message";
import {
  getCanonicalMatchPair,
  getMatchPartnerId,
  Match,
} from "@/models/Match";
import { User } from "@/models/User";
import type {
  ConversationListItem,
  ConversationPartner,
  MessageListItem,
} from "@/types/messaging";

function serializePartner(user: {
  _id: mongoose.Types.ObjectId;
  name: string;
  headline?: string | null;
  profilePhotoUrl?: string | null;
}): ConversationPartner {
  const photo = user.profilePhotoUrl?.trim();

  return {
    id: user._id.toString(),
    name: user.name,
    headline: user.headline?.trim() || undefined,
    profilePhotoUrl:
      photo && !isProfilePhotoPlaceholder(photo) ? photo : undefined,
  };
}

function serializeMessage(
  message: {
    _id: mongoose.Types.ObjectId;
    conversationId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    content: string;
    messageType: "text" | "image" | "document" | "system";
    isRead: boolean;
    createdAt: Date;
  },
  viewerId: string,
): MessageListItem {
  return {
    id: message._id.toString(),
    conversationId: message.conversationId.toString(),
    senderId: message.senderId.toString(),
    content: message.content,
    messageType: message.messageType,
    isRead: message.isRead,
    createdAt: message.createdAt.toISOString(),
    isOwn: message.senderId.toString() === viewerId,
  };
}

async function loadPartnerForConversation(
  conversation: { participants: mongoose.Types.ObjectId[] },
  viewerId: string,
): Promise<ConversationPartner | null> {
  const partnerId = getConversationPartnerId(conversation, viewerId);
  const partner = await User.findById(partnerId)
    .select("name headline profilePhotoUrl")
    .lean();

  if (!partner) {
    return null;
  }

  return serializePartner(partner);
}

export async function assertMatchedParticipants(
  userIdA: string,
  userIdB: string,
): Promise<void> {
  const [userA, userB] = getCanonicalMatchPair(userIdA, userIdB);

  const match = await Match.findOne({
    userA,
    userB,
    status: "matched",
  })
    .select("_id")
    .lean();

  if (!match) {
    throw new Error("Messaging is only available between matched founders");
  }
}

export async function ensureConversationForMatch(input: {
  matchId: string;
  userIdA: string;
  userIdB: string;
}): Promise<string> {
  await connectDB();
  await assertMatchedParticipants(input.userIdA, input.userIdB);

  const participants = getCanonicalMatchPair(input.userIdA, input.userIdB);
  const participantKey = getConversationParticipantKey(
    input.userIdA,
    input.userIdB,
  );

  const conversation = await Conversation.findOneAndUpdate(
    { participantKey },
    {
      participants,
      participantKey,
      matchId: new mongoose.Types.ObjectId(input.matchId),
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  ).select("_id");

  return conversation._id.toString();
}

export async function resolveConversationIdsForMatches(
  matches: {
    _id: mongoose.Types.ObjectId;
    userA: mongoose.Types.ObjectId;
    userB: mongoose.Types.ObjectId;
  }[],
): Promise<Map<string, string>> {
  await connectDB();

  if (matches.length === 0) {
    return new Map();
  }

  const matchIds = matches.map((match) => match._id);
  const existing = await Conversation.find({ matchId: { $in: matchIds } })
    .select("_id matchId")
    .lean<{ _id: mongoose.Types.ObjectId; matchId: mongoose.Types.ObjectId }[]>();

  const conversationByMatchId = new Map(
    existing.map((conversation) => [
      conversation.matchId.toString(),
      conversation._id.toString(),
    ]),
  );

  for (const match of matches) {
    const matchId = match._id.toString();

    if (conversationByMatchId.has(matchId)) {
      continue;
    }

    try {
      const conversationId = await ensureConversationForMatch({
        matchId,
        userIdA: match.userA.toString(),
        userIdB: match.userB.toString(),
      });
      conversationByMatchId.set(matchId, conversationId);
    } catch (error) {
      console.error("[messaging] Failed to ensure conversation for match", {
        matchId,
        error,
      });
    }
  }

  return conversationByMatchId;
}

export async function getConversationForUser(input: {
  conversationId: string;
  userId: string;
}): Promise<{
  _id: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  matchId: mongoose.Types.ObjectId;
} | null> {
  await connectDB();

  const conversation = await Conversation.findOne({
    _id: input.conversationId,
    participants: new mongoose.Types.ObjectId(input.userId),
  })
    .select("_id participants matchId")
    .lean();

  if (!conversation) {
    return null;
  }

  const match = await Match.findOne({
    _id: conversation.matchId,
    status: "matched",
    $or: [
      { userA: new mongoose.Types.ObjectId(input.userId) },
      { userB: new mongoose.Types.ObjectId(input.userId) },
    ],
  })
    .select("_id")
    .lean();

  if (!match) {
    return null;
  }

  const partnerId = getConversationPartnerId(conversation, input.userId);
  const blocked = await isBlockedBetween(input.userId, partnerId);

  if (blocked) {
    return null;
  }

  return conversation;
}

export async function getConversationsForUser(
  userId: string,
): Promise<ConversationListItem[]> {
  await connectDB();

  const viewerObjectId = new mongoose.Types.ObjectId(userId);
  const [matchedRows, blockedUserIds] = await Promise.all([
    Match.find({
      status: "matched",
      $or: [{ userA: viewerObjectId }, { userB: viewerObjectId }],
    })
      .select("_id userA userB")
      .lean<
        {
          _id: mongoose.Types.ObjectId;
          userA: mongoose.Types.ObjectId;
          userB: mongoose.Types.ObjectId;
        }[]
      >(),
    getBlockedRelationshipUserIds(userId),
  ]);

  await resolveConversationIdsForMatches(matchedRows);

  const conversations = await Conversation.find({
    participants: viewerObjectId,
  })
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .lean<
      {
        _id: mongoose.Types.ObjectId;
        participants: mongoose.Types.ObjectId[];
        matchId: mongoose.Types.ObjectId;
        lastMessage?: string | null;
        lastMessageAt?: Date | null;
        updatedAt: Date;
      }[]
    >();

  if (conversations.length === 0) {
    return [];
  }

  const matchIds = conversations.map((conversation) => conversation.matchId);
  const activeMatches = await Match.find({
    _id: { $in: matchIds },
    status: "matched",
  })
    .select("_id")
    .lean<{ _id: mongoose.Types.ObjectId }[]>();

  const activeMatchIds = new Set(
    activeMatches.map((match) => match._id.toString()),
  );
  const blockedPartnerIds = new Set(blockedUserIds);

  const eligibleConversations = conversations.filter((conversation) => {
    if (!activeMatchIds.has(conversation.matchId.toString())) {
      return false;
    }

    const partnerId = getConversationPartnerId(conversation, userId);
    return !blockedPartnerIds.has(partnerId);
  });

  if (eligibleConversations.length === 0) {
    return [];
  }

  const partnerIds = eligibleConversations.map((conversation) =>
    getConversationPartnerId(conversation, userId),
  );

  const [partners, unreadCounts] = await Promise.all([
    User.find({ _id: { $in: partnerIds } })
      .select("name headline profilePhotoUrl")
      .lean(),
    Message.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      {
        $match: {
          conversationId: {
            $in: eligibleConversations.map((conversation) => conversation._id),
          },
          senderId: { $ne: viewerObjectId },
          isRead: false,
        },
      },
      { $group: { _id: "$conversationId", count: { $sum: 1 } } },
    ]),
  ]);

  const partnerMap = new Map(
    partners.map((partner) => [partner._id.toString(), partner]),
  );
  const unreadMap = new Map(
    unreadCounts.map((entry) => [entry._id.toString(), entry.count]),
  );

  return eligibleConversations.flatMap((conversation) => {
    const partnerId = getConversationPartnerId(conversation, userId);
    const partner = partnerMap.get(partnerId);

    if (!partner) {
      return [];
    }

    return [
      {
        id: conversation._id.toString(),
        partner: serializePartner(partner),
        lastMessage: conversation.lastMessage?.trim() || "Start your conversation",
        lastMessageAt: (
          conversation.lastMessageAt ?? conversation.updatedAt
        ).toISOString(),
        unreadCount: unreadMap.get(conversation._id.toString()) ?? 0,
      } satisfies ConversationListItem,
    ];
  });
}

export async function getMessagesForConversation(input: {
  conversationId: string;
  userId: string;
}): Promise<{ messages: MessageListItem[]; partner: ConversationPartner }> {
  await connectDB();

  const conversation = await getConversationForUser(input);

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const partner = await loadPartnerForConversation(conversation, input.userId);

  if (!partner) {
    throw new Error("Conversation partner not found");
  }

  const messages = await Message.find({
    conversationId: conversation._id,
  })
    .sort({ createdAt: 1 })
    .lean();

  await Message.updateMany(
    {
      conversationId: conversation._id,
      senderId: { $ne: new mongoose.Types.ObjectId(input.userId) },
      isRead: false,
    },
    { isRead: true },
  );

  return {
    partner,
    messages: messages.map((message) =>
      serializeMessage(
        {
          ...message,
          messageType: message.messageType as
            | "text"
            | "image"
            | "document"
            | "system",
        },
        input.userId,
      ),
    ),
  };
}

export async function sendMessage(input: {
  conversationId: string;
  userId: string;
  content: string;
}): Promise<MessageListItem> {
  await connectDB();

  const trimmedContent = input.content.trim();

  if (!trimmedContent) {
    throw new Error("Message cannot be empty");
  }

  const conversation = await getConversationForUser({
    conversationId: input.conversationId,
    userId: input.userId,
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const recentDuplicate = await Message.findOne({
    conversationId: conversation._id,
    senderId: new mongoose.Types.ObjectId(input.userId),
    content: trimmedContent,
    createdAt: {
      $gte: new Date(Date.now() - MESSAGE_DUPLICATE_WINDOW_MS),
    },
  })
    .select("_id")
    .lean();

  if (recentDuplicate) {
    throw new Error("Please wait before sending the same message again");
  }

  const message = await Message.create({
    conversationId: conversation._id,
    senderId: new mongoose.Types.ObjectId(input.userId),
    content: trimmedContent,
    messageType: "text",
    isRead: false,
  });

  await Conversation.findByIdAndUpdate(conversation._id, {
    lastMessage: trimmedContent,
    lastMessageAt: message.createdAt,
  });

  await Match.findByIdAndUpdate(conversation.matchId, {
    lastActivityAt: message.createdAt,
  });

  console.info("[REALTIME] message persisted", {
    messageId: message._id.toString(),
    conversationId: conversation._id.toString(),
  });

  // Dynamic import keeps seed scripts free of the `server-only` Pusher module.
  const { publishNewMessageEvent } = await import(
    "@/lib/pusher/publish-message"
  );
  await publishNewMessageEvent({
    messageId: message._id.toString(),
    conversationId: conversation._id.toString(),
    senderId: message.senderId.toString(),
    recipientId: getConversationPartnerId(conversation, input.userId),
    text: message.content,
    sentAt: message.createdAt.toISOString(),
    messageType: "text",
  });

  return serializeMessage(
    {
      _id: message._id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      messageType: message.messageType as "text",
      isRead: message.isRead,
      createdAt: message.createdAt,
    },
    input.userId,
  );
}

export async function markConversationMessagesRead(input: {
  conversationId: string;
  userId: string;
}): Promise<number> {
  await connectDB();

  const conversation = await getConversationForUser(input);

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const result = await Message.updateMany(
    {
      conversationId: conversation._id,
      senderId: { $ne: new mongoose.Types.ObjectId(input.userId) },
      isRead: false,
    },
    { isRead: true },
  );

  return result.modifiedCount;
}

export async function backfillConversationsForMatchedUsers(
  userIds: string[],
): Promise<number> {
  await connectDB();

  const objectIds = userIds.map((id) => new mongoose.Types.ObjectId(id));
  const matches = await Match.find({
    status: "matched",
    $or: [{ userA: { $in: objectIds } }, { userB: { $in: objectIds } }],
  })
    .select("_id userA userB")
    .lean();

  let created = 0;

  for (const match of matches) {
    const userIdA = match.userA.toString();
    const userIdB = match.userB.toString();
    const participantKey = getConversationParticipantKey(userIdA, userIdB);
    const existing = await Conversation.findOne({
      $or: [{ participantKey }, { participants: getCanonicalMatchPair(userIdA, userIdB) }],
    })
      .select("_id")
      .lean();

    if (!existing) {
      created += 1;
    }

    await ensureConversationForMatch({
      matchId: match._id.toString(),
      userIdA,
      userIdB,
    });
  }

  return created;
}

export async function createSeedMessage(input: {
  conversationId: string;
  senderId: string;
  content: string;
  createdAt?: Date;
  isRead?: boolean;
}): Promise<void> {
  await connectDB();

  const conversation = await Conversation.findById(input.conversationId).select(
    "_id matchId",
  );

  if (!conversation) {
    throw new Error("Conversation not found for seed message");
  }

  const createdAt = input.createdAt ?? new Date();

  await Message.create({
    conversationId: conversation._id,
    senderId: new mongoose.Types.ObjectId(input.senderId),
    content: input.content.trim(),
    messageType: "text",
    isRead: input.isRead ?? Math.random() > 0.35,
    createdAt,
    updatedAt: createdAt,
  });

  await Conversation.findByIdAndUpdate(conversation._id, {
    lastMessage: input.content.trim(),
    lastMessageAt: createdAt,
  });

  await Match.findByIdAndUpdate(conversation.matchId, {
    lastActivityAt: createdAt,
  });
}

export { getMatchPartnerId };
