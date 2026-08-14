export const USER_ROLES = ["user", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ACCOUNT_STATUSES = ["active", "suspended", "banned"] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];
