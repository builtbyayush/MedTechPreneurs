import mongoose from "mongoose";

import { isProfilePhotoPlaceholder } from "@/constants/profile";
import { connectDB } from "@/lib/db";
import { Block } from "@/models/Block";
import { User } from "@/models/User";
import type { BlockedUserListItem, BlockRecord } from "@/types/block";

export class BlockError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "BlockError";
    this.status = status;
  }
}

function serializeBlock(block: {
  _id: { toString(): string };
  blockerId: mongoose.Types.ObjectId;
  blockedId: mongoose.Types.ObjectId;
  createdAt: Date;
}): BlockRecord {
  return {
    id: block._id.toString(),
    blockerId: block.blockerId.toString(),
    blockedId: block.blockedId.toString(),
    createdAt: block.createdAt.toISOString(),
  };
}

export async function isBlockedBetween(
  userIdA: string,
  userIdB: string,
): Promise<boolean> {
  if (!userIdA || !userIdB || userIdA === userIdB) {
    return false;
  }

  await connectDB();

  const idA = new mongoose.Types.ObjectId(userIdA);
  const idB = new mongoose.Types.ObjectId(userIdB);

  const existing = await Block.findOne({
    $or: [
      { blockerId: idA, blockedId: idB },
      { blockerId: idB, blockedId: idA },
    ],
  })
    .select("_id")
    .lean();

  return Boolean(existing);
}

export async function assertNotBlocked(
  userIdA: string,
  userIdB: string,
): Promise<void> {
  const blocked = await isBlockedBetween(userIdA, userIdB);

  if (blocked) {
    throw new BlockError("You cannot interact with this founder.", 403);
  }
}

export async function getBlockedRelationshipUserIds(
  userId: string,
): Promise<string[]> {
  await connectDB();

  const viewerObjectId = new mongoose.Types.ObjectId(userId);

  const blocks = await Block.find({
    $or: [{ blockerId: viewerObjectId }, { blockedId: viewerObjectId }],
  })
    .select("blockerId blockedId")
    .lean<{ blockerId: mongoose.Types.ObjectId; blockedId: mongoose.Types.ObjectId }[]>();

  const ids = new Set<string>();

  for (const block of blocks) {
    const blockerId = block.blockerId.toString();
    const blockedId = block.blockedId.toString();

    if (blockerId === userId) {
      ids.add(blockedId);
    } else {
      ids.add(blockerId);
    }
  }

  return [...ids];
}

export async function blockUser(
  blockerId: string,
  blockedId: string,
): Promise<BlockRecord> {
  await connectDB();

  if (blockerId === blockedId) {
    throw new BlockError("You cannot block yourself.");
  }

  if (!mongoose.Types.ObjectId.isValid(blockedId)) {
    throw new BlockError("User not found.", 404);
  }

  const target = await User.findById(blockedId).select("_id").lean();

  if (!target) {
    throw new BlockError("User not found.", 404);
  }

  const blockerObjectId = new mongoose.Types.ObjectId(blockerId);
  const blockedObjectId = new mongoose.Types.ObjectId(blockedId);

  try {
    const block = await Block.findOneAndUpdate(
      { blockerId: blockerObjectId, blockedId: blockedObjectId },
      { blockerId: blockerObjectId, blockedId: blockedObjectId },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );

    return serializeBlock(block);
  } catch (error) {
    // Race on unique index — treat as idempotent success
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      const existing = await Block.findOne({
        blockerId: blockerObjectId,
        blockedId: blockedObjectId,
      });

      if (existing) {
        return serializeBlock(existing);
      }
    }

    throw error;
  }
}

export async function unblockUser(
  blockerId: string,
  blockedId: string,
): Promise<void> {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(blockedId)) {
    throw new BlockError("Block not found.", 404);
  }

  const result = await Block.deleteOne({
    blockerId: new mongoose.Types.ObjectId(blockerId),
    blockedId: new mongoose.Types.ObjectId(blockedId),
  });

  if (result.deletedCount === 0) {
    throw new BlockError("Block not found.", 404);
  }
}

export async function getBlockedUsersForBlocker(
  blockerId: string,
): Promise<BlockedUserListItem[]> {
  await connectDB();

  const blocks = await Block.find({
    blockerId: new mongoose.Types.ObjectId(blockerId),
  })
    .sort({ createdAt: -1 })
    .lean<
      {
        blockedId: mongoose.Types.ObjectId;
        createdAt: Date;
      }[]
    >();

  if (blocks.length === 0) {
    return [];
  }

  const blockedIds = blocks.map((block) => block.blockedId);
  const users = await User.find({ _id: { $in: blockedIds } })
    .select("name profilePhotoUrl")
    .lean();

  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  return blocks.flatMap((block) => {
    const user = userMap.get(block.blockedId.toString());

    if (!user) {
      return [];
    }

    const photo = user.profilePhotoUrl?.trim();

    return [
      {
        id: block.blockedId.toString(),
        name: user.name,
        profilePhotoUrl:
          photo && !isProfilePhotoPlaceholder(photo) ? photo : undefined,
        blockedAt: block.createdAt.toISOString(),
      } satisfies BlockedUserListItem,
    ];
  });
}
