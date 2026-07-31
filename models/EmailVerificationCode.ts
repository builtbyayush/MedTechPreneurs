import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const EmailVerificationCodeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    codeHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },
    lastSentAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

EmailVerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type EmailVerificationCodeDocument = InferSchemaType<
  typeof EmailVerificationCodeSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const EmailVerificationCode: Model<EmailVerificationCodeDocument> =
  mongoose.models.EmailVerificationCode ??
  mongoose.model<EmailVerificationCodeDocument>(
    "EmailVerificationCode",
    EmailVerificationCodeSchema,
  );
