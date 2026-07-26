import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ConversationSchema = new Schema(
  {
    participants: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: true,
      validate: {
        validator: (value: mongoose.Types.ObjectId[]) => value.length === 2,
        message: "Conversation must have exactly two participants",
      },
    },
    matchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      required: true,
      index: true,
    },
    lastMessage: { type: String, trim: true, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

ConversationSchema.index({ participants: 1 }, { unique: true });
ConversationSchema.index({ lastMessageAt: -1 });

export type ConversationDocument = InferSchemaType<typeof ConversationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Conversation: Model<ConversationDocument> =
  mongoose.models.Conversation ??
  mongoose.model<ConversationDocument>("Conversation", ConversationSchema);

export function getConversationPartnerId(
  conversation: { participants: mongoose.Types.ObjectId[] },
  viewerId: string,
): string {
  return conversation.participants
    .map((participant) => participant.toString())
    .find((participantId) => participantId !== viewerId)!;
}
