import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const DISCOVERY_ACTIONS = ["pass", "connect"] as const;

const DiscoveryActionSchema = new Schema(
  {
    viewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: DISCOVERY_ACTIONS,
      required: true,
    },
    /** One pre-match introductory message (LinkedIn-style note). */
    introMessage: { type: String, trim: true, maxlength: 300 },
    introSentAt: { type: Date },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

DiscoveryActionSchema.index(
  { viewerId: 1, targetUserId: 1 },
  { unique: true },
);

export type DiscoveryActionDocument = InferSchemaType<
  typeof DiscoveryActionSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const DiscoveryAction: Model<DiscoveryActionDocument> =
  mongoose.models.DiscoveryAction ??
  mongoose.model<DiscoveryActionDocument>(
    "DiscoveryAction",
    DiscoveryActionSchema,
  );
