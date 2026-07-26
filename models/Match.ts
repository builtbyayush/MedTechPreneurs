import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const MATCH_STATUSES = ["pending", "matched", "archived"] as const;

const MatchSchema = new Schema(
  {
    userA: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userB: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: MATCH_STATUSES,
      default: "matched",
      required: true,
    },
    matchedAt: { type: Date },
    lastActivityAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
);

MatchSchema.index({ userA: 1, userB: 1 }, { unique: true });
MatchSchema.index({ status: 1, matchedAt: -1 });

export type MatchDocument = InferSchemaType<typeof MatchSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Match: Model<MatchDocument> =
  mongoose.models.Match ?? mongoose.model<MatchDocument>("Match", MatchSchema);

export function getCanonicalMatchPair(
  userIdA: string,
  userIdB: string,
): [mongoose.Types.ObjectId, mongoose.Types.ObjectId] {
  const a = new mongoose.Types.ObjectId(userIdA);
  const b = new mongoose.Types.ObjectId(userIdB);
  return a.toString() < b.toString() ? [a, b] : [b, a];
}

export function getMatchPartnerId(
  match: { userA: mongoose.Types.ObjectId; userB: mongoose.Types.ObjectId },
  viewerId: string,
): string {
  return match.userA.toString() === viewerId
    ? match.userB.toString()
    : match.userA.toString();
}
