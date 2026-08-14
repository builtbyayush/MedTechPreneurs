import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const BlockSchema = new Schema(
  {
    blockerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    blockedId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

BlockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });

export type BlockDocument = InferSchemaType<typeof BlockSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
};

export const Block: Model<BlockDocument> =
  mongoose.models.Block ?? mongoose.model<BlockDocument>("Block", BlockSchema);
