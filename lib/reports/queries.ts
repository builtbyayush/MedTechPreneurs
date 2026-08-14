import mongoose from "mongoose";

import { isProfilePhotoPlaceholder } from "@/constants/profile";
import {
  REPORT_ACTION_LABELS,
  REPORT_DUPLICATE_WINDOW_MS,
  REPORT_REASON_LABELS,
  SUSPENSION_DURATION_MS,
  type ReportAction,
  type ReportReason,
  type ReportStatus,
  type SuspensionDuration,
} from "@/constants/reports";
import { blockUser } from "@/lib/blocks/queries";
import {
  syncIsActiveFromAccountStatus,
} from "@/lib/auth/account";
import { connectDB } from "@/lib/db";
import type {
  CreateReportInput,
  ReviewReportInput,
} from "@/lib/validations/report";
import { Report } from "@/models/Report";
import { User } from "@/models/User";
import type {
  AdminReportDetail,
  AdminReportListItem,
  AdminReportListResponse,
  ModerationUserSummary,
  ReportRecord,
} from "@/types/report";

export class ReportError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ReportError";
    this.status = status;
  }
}

function serializeReport(report: {
  _id: { toString(): string };
  reporterId: mongoose.Types.ObjectId;
  reportedUserId: mongoose.Types.ObjectId;
  reason: ReportReason;
  description?: string | null;
  status: ReportStatus | "dismissed";
  action?: ReportAction | null;
  reviewedBy?: mongoose.Types.ObjectId | null;
  reviewedAt?: Date | null;
  adminNotes?: string | null;
  createdAt: Date;
  updatedAt?: Date;
}): ReportRecord {
  // Normalize legacy status "dismissed" → reviewed + dismissed action
  const legacyDismissed = report.status === "dismissed";
  const status: ReportStatus = legacyDismissed
    ? "reviewed"
    : report.status === "reviewed"
      ? "reviewed"
      : "pending";
  const action: ReportAction = legacyDismissed
    ? "dismissed"
    : (report.action ?? "none");

  return {
    id: report._id.toString(),
    reporterId: report.reporterId.toString(),
    reportedUserId: report.reportedUserId.toString(),
    reason: report.reason,
    description: report.description?.trim() || undefined,
    status,
    action,
    reviewedBy: report.reviewedBy?.toString(),
    reviewedAt: report.reviewedAt?.toISOString(),
    adminNotes: report.adminNotes?.trim() || undefined,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt?.toISOString(),
  };
}

function serializeUserSummary(user: {
  _id: mongoose.Types.ObjectId;
  name: string;
  email?: string | null;
  headline?: string | null;
  founderRole?: string | null;
  companyName?: string | null;
  profilePhotoUrl?: string | null;
  accountStatus?: string | null;
  suspendedUntil?: Date | null;
  moderationWarningCount?: number | null;
  createdAt?: Date;
}): ModerationUserSummary {
  const photo = user.profilePhotoUrl?.trim();

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email ?? undefined,
    headline: user.headline?.trim() || undefined,
    founderRole: user.founderRole ?? undefined,
    companyName: user.companyName?.trim() || undefined,
    profilePhotoUrl:
      photo && !isProfilePhotoPlaceholder(photo) ? photo : undefined,
    accountStatus: user.accountStatus ?? "active",
    suspendedUntil: user.suspendedUntil?.toISOString(),
    moderationWarningCount: user.moderationWarningCount ?? 0,
    createdAt: user.createdAt?.toISOString(),
  };
}

function toListItem(
  report: ReportRecord,
  reportedUser: { id: string; name: string; profilePhotoUrl?: string },
  reporter: { id: string; name: string },
): AdminReportListItem {
  return {
    id: report.id,
    reason: report.reason,
    reasonLabel: REPORT_REASON_LABELS[report.reason],
    status: report.status,
    action: report.action,
    description: report.description,
    createdAt: report.createdAt,
    reportedUser,
    reporter,
  };
}

/**
 * Create a report and auto-block the reported user for the reporter.
 * Rapid duplicates (same reporter+reported+reason within window) are idempotent.
 */
export async function createUserReportWithBlock(
  reporterId: string,
  reportedUserId: string,
  input: CreateReportInput,
): Promise<ReportRecord> {
  await connectDB();

  if (reporterId === reportedUserId) {
    throw new ReportError("You cannot report yourself");
  }

  if (!mongoose.Types.ObjectId.isValid(reportedUserId)) {
    throw new ReportError("Reported user not found", 404);
  }

  const reportedUser = await User.findById(reportedUserId)
    .select("_id accountStatus")
    .lean();

  if (!reportedUser) {
    throw new ReportError("Reported user not found", 404);
  }

  if (reportedUser.accountStatus === "banned") {
    throw new ReportError("Reported user not found", 404);
  }

  const windowStart = new Date(Date.now() - REPORT_DUPLICATE_WINDOW_MS);
  const recentDuplicate = await Report.findOne({
    reporterId: new mongoose.Types.ObjectId(reporterId),
    reportedUserId: new mongoose.Types.ObjectId(reportedUserId),
    reason: input.reason,
    createdAt: { $gte: windowStart },
  }).sort({ createdAt: -1 });

  if (recentDuplicate) {
    // Still ensure block exists for the reporter.
    try {
      await blockUser(reporterId, reportedUserId);
    } catch {
      // Ignore — report already exists
    }
    return serializeReport(recentDuplicate);
  }

  const report = await Report.create({
    reporterId: new mongoose.Types.ObjectId(reporterId),
    reportedUserId: new mongoose.Types.ObjectId(reportedUserId),
    reason: input.reason,
    description: input.description?.trim() || undefined,
    status: "pending",
    action: "none",
  });

  try {
    await blockUser(reporterId, reportedUserId);
  } catch (error) {
    console.error("[reports] Auto-block after report failed", {
      reporterId,
      reportedUserId,
      error,
    });
  }

  return serializeReport(report);
}

/** @deprecated Prefer createUserReportWithBlock — kept for seed helpers */
export async function createUserReport(
  reporterId: string,
  input: CreateReportInput & { reportedUserId: string },
): Promise<ReportRecord> {
  return createUserReportWithBlock(reporterId, input.reportedUserId, input);
}

export async function listAdminReports(input: {
  status?: ReportStatus;
  page?: number;
  limit?: number;
}): Promise<AdminReportListResponse> {
  await connectDB();

  const status = input.status ?? "pending";
  const page = Math.max(1, input.page ?? 1);
  const limit = Math.min(50, Math.max(1, input.limit ?? 20));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> =
    status === "pending"
      ? { status: "pending" }
      : { $or: [{ status: "reviewed" }, { status: "dismissed" }] };

  const [reports, total, pendingCount] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Report.countDocuments(filter),
    Report.countDocuments({ status: "pending" }),
  ]);

  const userIds = new Set<string>();
  for (const report of reports) {
    userIds.add(report.reporterId.toString());
    userIds.add(report.reportedUserId.toString());
  }

  const users = await User.find({
    _id: { $in: [...userIds].map((id) => new mongoose.Types.ObjectId(id)) },
  })
    .select("name profilePhotoUrl")
    .lean();

  const userMap = new Map(
    users.map((user) => [user._id.toString(), user]),
  );

  const items = reports.flatMap((report) => {
    const serialized = serializeReport(report);
    const reported = userMap.get(serialized.reportedUserId);
    const reporter = userMap.get(serialized.reporterId);

    if (!reported || !reporter) {
      return [];
    }

    const photo = reported.profilePhotoUrl?.trim();

    return [
      toListItem(
        serialized,
        {
          id: reported._id.toString(),
          name: reported.name,
          profilePhotoUrl:
            photo && !isProfilePhotoPlaceholder(photo) ? photo : undefined,
        },
        {
          id: reporter._id.toString(),
          name: reporter.name,
        },
      ),
    ];
  });

  return {
    reports: items,
    total,
    page,
    limit,
    pendingCount,
  };
}

export async function getAdminReportDetail(
  reportId: string,
): Promise<AdminReportDetail> {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    throw new ReportError("Report not found", 404);
  }

  const report = await Report.findById(reportId).lean();

  if (!report) {
    throw new ReportError("Report not found", 404);
  }

  const serialized = serializeReport(report);

  const [reportedUser, reporter, previousReports, previousReportCount] =
    await Promise.all([
      User.findById(serialized.reportedUserId)
        .select(
          "name email headline founderRole companyName profilePhotoUrl accountStatus suspendedUntil moderationWarningCount createdAt",
        )
        .lean(),
      User.findById(serialized.reporterId)
        .select(
          "name email headline founderRole companyName profilePhotoUrl accountStatus suspendedUntil moderationWarningCount createdAt",
        )
        .lean(),
      Report.find({
        reportedUserId: report.reportedUserId,
        _id: { $ne: report._id },
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Report.countDocuments({
        reportedUserId: report.reportedUserId,
        _id: { $ne: report._id },
      }),
    ]);

  if (!reportedUser || !reporter) {
    throw new ReportError("Report not found", 404);
  }

  const previousReporterIds = [
    ...new Set(previousReports.map((item) => item.reporterId.toString())),
  ];
  const previousReporters = previousReporterIds.length
    ? await User.find({
        _id: {
          $in: previousReporterIds.map(
            (id) => new mongoose.Types.ObjectId(id),
          ),
        },
      })
        .select("name")
        .lean()
    : [];
  const previousReporterMap = new Map(
    previousReporters.map((user) => [user._id.toString(), user.name]),
  );

  return {
    report: {
      ...serialized,
      reasonLabel: REPORT_REASON_LABELS[serialized.reason],
      actionLabel: REPORT_ACTION_LABELS[serialized.action],
    },
    reportedUser: serializeUserSummary(reportedUser),
    reporter: serializeUserSummary(reporter),
    previousReportCount,
    previousReports: previousReports.map((item) => {
      const row = serializeReport(item);
      return toListItem(
        row,
        {
          id: reportedUser._id.toString(),
          name: reportedUser.name,
        },
        {
          id: row.reporterId,
          name: previousReporterMap.get(row.reporterId) ?? "Unknown",
        },
      );
    }),
  };
}

export async function reviewReport(input: {
  reportId: string;
  adminId: string;
  review: ReviewReportInput;
}): Promise<ReportRecord> {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(input.reportId)) {
    throw new ReportError("Report not found", 404);
  }

  const report = await Report.findById(input.reportId);

  if (!report) {
    throw new ReportError("Report not found", 404);
  }

  if (report.status === "reviewed" || report.status === ("dismissed" as string)) {
    throw new ReportError("This report has already been reviewed", 409);
  }

  const now = new Date();
  const action = input.review.action as Exclude<ReportAction, "none">;
  const adminNotes = input.review.adminNotes?.trim() || undefined;

  report.status = "reviewed";
  report.action = action;
  report.reviewedBy = new mongoose.Types.ObjectId(input.adminId);
  report.reviewedAt = now;
  report.adminNotes = adminNotes;

  await report.save();

  if (action === "warning") {
    await User.updateOne(
      { _id: report.reportedUserId },
      {
        $inc: { moderationWarningCount: 1 },
        $set: { lastModerationWarningAt: now },
      },
    );
  }

  if (action === "suspension") {
    const duration = input.review.suspensionDuration as SuspensionDuration;
    const suspendedUntil = new Date(
      now.getTime() + SUSPENSION_DURATION_MS[duration],
    );

    await User.updateOne(
      { _id: report.reportedUserId },
      {
        $set: {
          accountStatus: "suspended",
          suspendedUntil,
          isActive: syncIsActiveFromAccountStatus({
            accountStatus: "suspended",
            suspendedUntil,
          }),
        },
      },
    );
  }

  if (action === "ban") {
    await User.updateOne(
      { _id: report.reportedUserId },
      {
        $set: {
          accountStatus: "banned",
          suspendedUntil: null,
          isActive: false,
        },
      },
    );
  }

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
      action: "none",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
}
