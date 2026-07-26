import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

import { REPORT_REASONS, REPORT_STATUSES } from "@/constants/reports";

const ReportSchema = new Schema(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reportedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: REPORT_REASONS,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: REPORT_STATUSES,
      default: "pending",
      index: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

ReportSchema.index({ reporterId: 1, reportedUserId: 1 });

export type ReportDocument = InferSchemaType<typeof ReportSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
};

export const Report: Model<ReportDocument> =
  mongoose.models.Report ??
  mongoose.model<ReportDocument>("Report", ReportSchema);
