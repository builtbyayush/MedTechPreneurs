export const REPORT_REASONS = [
  "inappropriate_content",
  "spam",
  "harassment",
  "fake_profile",
  "other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  inappropriate_content: "Inappropriate content",
  spam: "Spam or misleading profile",
  harassment: "Harassment or abuse",
  fake_profile: "Fake or impersonation",
  other: "Other concern",
};

export const REPORT_STATUSES = ["pending", "reviewed", "dismissed"] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];
