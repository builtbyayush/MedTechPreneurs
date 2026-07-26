import mongoose from "mongoose";

import type { ReportReason } from "@/constants/reports";
import { connectDB } from "@/lib/db";
import type { CreateReportInput } from "@/lib/validations/report";
import { Report } from "@/models/Report";
import { User } from "@/models/User";
import type { ReportRecord } from "@/types/report";

function serializeReport(report: {
  _id: { toString(): string };
  reporterId: mongoose.Types.ObjectId;
  reportedUserId: mongoose.Types.ObjectId;
  reason: ReportReason;
  description?: string | null;
  status: ReportRecord["status"];
  createdAt: Date;
}): ReportRecord {
  return {
    id: report._id.toString(),
    reporterId: report.reporterId.toString(),
    reportedUserId: report.reportedUserId.toString(),
    reason: report.reason,
    description: report.description?.trim() || undefined,
    status: report.status,
    createdAt: report.createdAt.toISOString(),
  };
}

export async function createUserReport(
  reporterId: string,
  input: CreateReportInput,
): Promise<ReportRecord> {
  await connectDB();

  if (reporterId === input.reportedUserId) {
    throw new Error("You cannot report yourself");
  }

  const reportedUser = await User.findById(input.reportedUserId)
    .select("_id")
    .lean();

  if (!reportedUser) {
    throw new Error("Reported user not found");
  }

  const report = await Report.create({
    reporterId: new mongoose.Types.ObjectId(reporterId),
    reportedUserId: new mongoose.Types.ObjectId(input.reportedUserId),
    reason: input.reason,
    description: input.description?.trim() || undefined,
    status: "pending",
  });

  return serializeReport(report);
}

export async function seedReport(input: {
  reporterEmail: string;
  reportedEmail: string;
  reason: ReportReason;
  description?: string;
}): Promise<void> {
  await connectDB();

  const [reporter, reported] = await Promise.all([
    User.findOne({ email: input.reporterEmail.toLowerCase() }).select("_id"),
    User.findOne({ email: input.reportedEmail.toLowerCase() }).select("_id"),
  ]);

  if (!reporter || !reported) {
    return;
  }

  await Report.findOneAndUpdate(
    {
      reporterId: reporter._id,
      reportedUserId: reported._id,
      reason: input.reason,
    },
    {
      reporterId: reporter._id,
      reportedUserId: reported._id,
      reason: input.reason,
      description: input.description,
      status: "pending",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
}
