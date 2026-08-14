export const REPORT_REASONS = [
  "harassment",
  "spam",
  "fake_profile",
  "inappropriate_content",
  "fraud_or_scam",
  "impersonation",
  "other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  harassment: "Harassment or abusive behavior",
  spam: "Spam",
  fake_profile: "Fake or misleading profile",
  inappropriate_content: "Inappropriate content",
  fraud_or_scam: "Fraud or scam",
  impersonation: "Impersonation",
  other: "Other",
};

export const REPORT_STATUSES = ["pending", "reviewed"] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_ACTIONS = [
  "none",
  "dismissed",
  "warning",
  "suspension",
  "ban",
] as const;

export type ReportAction = (typeof REPORT_ACTIONS)[number];

export const REPORT_ACTION_LABELS: Record<ReportAction, string> = {
  none: "None",
  dismissed: "Dismissed",
  warning: "Warning",
  suspension: "Suspension",
  ban: "Ban",
};

/** Rapid duplicate window for same reporter + reported + reason */
export const REPORT_DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

export const SUSPENSION_DURATIONS = ["24h", "7d", "30d"] as const;

export type SuspensionDuration = (typeof SUSPENSION_DURATIONS)[number];

export const SUSPENSION_DURATION_LABELS: Record<SuspensionDuration, string> = {
  "24h": "24 hours",
  "7d": "7 days",
  "30d": "30 days",
};

export const SUSPENSION_DURATION_MS: Record<SuspensionDuration, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};
