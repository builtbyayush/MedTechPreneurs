import type { ReportReason, ReportStatus } from "@/constants/reports";

export type ReportRecord = {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  createdAt: string;
};

export type CreateReportInput = {
  reportedUserId: string;
  reason: ReportReason;
  description?: string;
};

export type CreateReportResponse = {
  ok: true;
  report: ReportRecord;
  message: string;
};
