/**
 * One-time fix for the incorrect unique index on `conversations.participants`.
 *
 * The old `{ participants: 1, unique: true }` index treated each participant
 * ID as globally unique, blocking multiple conversations per user.
 *
 * Run: npx tsx --env-file=.env.local scripts/fix-conversation-indexes.ts
 */
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import {
  Conversation,
  getConversationParticipantKey,
} from "@/models/Conversation";
import { getCanonicalMatchPair } from "@/models/Match";

async function main() {
  await connectDB();
  const collection = Conversation.collection;

  const indexes = await collection.indexes();
  const badIndex = indexes.find(
    (index) =>
      index.key?.participants === 1 &&
      index.unique === true &&
      Object.keys(index.key).length === 1,
  );

  if (badIndex?.name) {
    console.info(`Dropping incorrect index: ${badIndex.name}`);
    await collection.dropIndex(badIndex.name);
  } else {
    console.info("Incorrect participants unique index not found — skipping drop");
  }

  const conversations = await Conversation.find({})
    .select("_id participants participantKey")
    .lean<
      {
        _id: mongoose.Types.ObjectId;
        participants: mongoose.Types.ObjectId[];
        participantKey?: string | null;
      }[]
    >();

  let backfilled = 0;

  for (const conversation of conversations) {
    if (conversation.participants.length !== 2) {
      continue;
    }

    const [userA, userB] = getCanonicalMatchPair(
      conversation.participants[0]!.toString(),
      conversation.participants[1]!.toString(),
    );
    const participantKey = getConversationParticipantKey(
      userA.toString(),
      userB.toString(),
    );

    if (conversation.participantKey === participantKey) {
      continue;
    }

    await Conversation.updateOne(
      { _id: conversation._id },
      { $set: { participantKey, participants: [userA, userB] } },
    );
    backfilled += 1;
  }

  console.info(`Backfilled participantKey on ${backfilled} conversation(s)`);
  await Conversation.syncIndexes();
  console.info("Conversation indexes synced");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
