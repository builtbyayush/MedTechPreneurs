import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

import {
  REPORT_ACTIONS,
  REPORT_REASONS,
  REPORT_STATUSES,
} from "@/constants/reports";

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
    action: {
      type: String,
      enum: REPORT_ACTIONS,
      default: "none",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

ReportSchema.index({ reporterId: 1, reportedUserId: 1 });
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ reportedUserId: 1, createdAt: -1 });

export type ReportDocument = InferSchemaType<typeof ReportSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Report: Model<ReportDocument> =
  mongoose.models.Report ??
  mongoose.model<ReportDocument>("Report", ReportSchema);
