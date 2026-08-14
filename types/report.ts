import type {
  ReportAction,
  ReportReason,
  ReportStatus,
  SuspensionDuration,
} from "@/constants/reports";

export type ReportRecord = {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  action: ReportAction;
  reviewedBy?: string;
  reviewedAt?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
};

export type CreateReportInput = {
  reason: ReportReason;
  description?: string;
};

export type CreateReportResponse = {
  ok: true;
  report: ReportRecord;
  message: string;
};

export type ModerationUserSummary = {
  id: string;
  name: string;
  email?: string;
  headline?: string;
  founderRole?: string;
  companyName?: string;
  profilePhotoUrl?: string;
  accountStatus: string;
  suspendedUntil?: string;
  moderationWarningCount: number;
  createdAt?: string;
};

export type AdminReportListItem = {
  id: string;
  reason: ReportReason;
  reasonLabel: string;
  status: ReportStatus;
  action: ReportAction;
  description?: string;
  createdAt: string;
  reportedUser: {
    id: string;
    name: string;
    profilePhotoUrl?: string;
  };
  reporter: {
    id: string;
    name: string;
  };
};

export type AdminReportListResponse = {
  reports: AdminReportListItem[];
  total: number;
  page: number;
  limit: number;
  pendingCount: number;
};

export type AdminReportDetail = {
  report: ReportRecord & {
    reasonLabel: string;
    actionLabel: string;
  };
  reportedUser: ModerationUserSummary;
  reporter: ModerationUserSummary;
  previousReports: AdminReportListItem[];
  previousReportCount: number;
};

export type ReviewReportInput = {
  action: Exclude<ReportAction, "none">;
  adminNotes?: string;
  suspensionDuration?: SuspensionDuration;
};
