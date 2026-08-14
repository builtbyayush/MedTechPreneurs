import type { AccountStatus, UserRole } from "@/constants/roles";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export class AccountAccessError extends Error {
  status: number;
  code: "suspended" | "banned" | "forbidden";

  constructor(
    message: string,
    code: "suspended" | "banned" | "forbidden",
    status = 403,
  ) {
    super(message);
    this.name = "AccountAccessError";
    this.code = code;
    this.status = status;
  }
}

export type AccountAccessState = {
  allowed: boolean;
  role: UserRole;
  accountStatus: AccountStatus;
  suspendedUntil?: Date | null;
  reason?: "suspended" | "banned";
};

type AccountFields = {
  role?: string | null;
  accountStatus?: string | null;
  suspendedUntil?: Date | null;
  isActive?: boolean | null;
};

export function getAccountAccessState(user: AccountFields): AccountAccessState {
  const role: UserRole = user.role === "admin" ? "admin" : "user";
  let accountStatus: AccountStatus =
    user.accountStatus === "suspended" || user.accountStatus === "banned"
      ? user.accountStatus
      : "active";

  // Expired suspensions behave as active.
  if (
    accountStatus === "suspended" &&
    user.suspendedUntil &&
    user.suspendedUntil.getTime() <= Date.now()
  ) {
    accountStatus = "active";
  }

  if (role === "admin") {
    return {
      allowed: true,
      role,
      accountStatus,
      suspendedUntil: user.suspendedUntil ?? null,
    };
  }

  if (accountStatus === "banned") {
    return {
      allowed: false,
      role,
      accountStatus,
      suspendedUntil: user.suspendedUntil ?? null,
      reason: "banned",
    };
  }

  if (accountStatus === "suspended") {
    return {
      allowed: false,
      role,
      accountStatus,
      suspendedUntil: user.suspendedUntil ?? null,
      reason: "suspended",
    };
  }

  return {
    allowed: true,
    role,
    accountStatus: "active",
    suspendedUntil: null,
  };
}

export function syncIsActiveFromAccountStatus(input: {
  accountStatus: AccountStatus;
  suspendedUntil?: Date | null;
}): boolean {
  if (input.accountStatus === "banned") {
    return false;
  }

  if (input.accountStatus === "suspended") {
    if (
      input.suspendedUntil &&
      input.suspendedUntil.getTime() <= Date.now()
    ) {
      return true;
    }
    return false;
  }

  return true;
}

export async function loadAccountAccess(
  userId: string,
): Promise<AccountAccessState | null> {
  await connectDB();

  const user = await User.findById(userId)
    .select("role accountStatus suspendedUntil isActive")
    .lean();

  if (!user) {
    return null;
  }

  const state = getAccountAccessState(user);

  // Lazily clear expired suspensions in the DB.
  if (
    user.accountStatus === "suspended" &&
    user.suspendedUntil &&
    user.suspendedUntil.getTime() <= Date.now() &&
    state.accountStatus === "active"
  ) {
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          accountStatus: "active",
          suspendedUntil: null,
          isActive: true,
        },
      },
    );
  }

  return state;
}

export async function assertActiveAccount(userId: string): Promise<void> {
  const state = await loadAccountAccess(userId);

  if (!state) {
    throw new AccountAccessError("Account not found.", "forbidden", 401);
  }

  if (!state.allowed) {
    if (state.reason === "banned") {
      throw new AccountAccessError(
        "Your account has been permanently disabled.",
        "banned",
      );
    }

    throw new AccountAccessError(
      "Your account is temporarily suspended.",
      "suspended",
    );
  }
}

export async function requireAdmin(userId: string | undefined | null): Promise<{
  id: string;
  role: "admin";
}> {
  if (!userId) {
    throw new AccountAccessError("Unauthorized", "forbidden", 401);
  }

  await connectDB();

  const user = await User.findById(userId).select("role").lean();

  if (!user) {
    throw new AccountAccessError("Unauthorized", "forbidden", 401);
  }

  if (user.role !== "admin") {
    throw new AccountAccessError("Forbidden", "forbidden", 403);
  }

  return { id: userId, role: "admin" };
}
