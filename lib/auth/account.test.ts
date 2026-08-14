import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getAccountAccessState,
  syncIsActiveFromAccountStatus,
} from "@/lib/auth/account";

describe("account access", () => {
  it("allows active users", () => {
    const state = getAccountAccessState({
      role: "user",
      accountStatus: "active",
    });
    expect(state.allowed).toBe(true);
    expect(state.accountStatus).toBe("active");
  });

  it("blocks suspended users", () => {
    const state = getAccountAccessState({
      role: "user",
      accountStatus: "suspended",
      suspendedUntil: new Date(Date.now() + 60_000),
    });
    expect(state.allowed).toBe(false);
    expect(state.reason).toBe("suspended");
  });

  it("treats expired suspensions as active", () => {
    const state = getAccountAccessState({
      role: "user",
      accountStatus: "suspended",
      suspendedUntil: new Date(Date.now() - 60_000),
    });
    expect(state.allowed).toBe(true);
    expect(state.accountStatus).toBe("active");
  });

  it("blocks banned users", () => {
    const state = getAccountAccessState({
      role: "user",
      accountStatus: "banned",
    });
    expect(state.allowed).toBe(false);
    expect(state.reason).toBe("banned");
  });

  it("exempts admins from account status lockout", () => {
    const state = getAccountAccessState({
      role: "admin",
      accountStatus: "suspended",
      suspendedUntil: new Date(Date.now() + 60_000),
    });
    expect(state.allowed).toBe(true);
    expect(state.role).toBe("admin");
  });

  it("syncs isActive from account status", () => {
    expect(
      syncIsActiveFromAccountStatus({ accountStatus: "active" }),
    ).toBe(true);
    expect(
      syncIsActiveFromAccountStatus({
        accountStatus: "suspended",
        suspendedUntil: new Date(Date.now() + 60_000),
      }),
    ).toBe(false);
    expect(syncIsActiveFromAccountStatus({ accountStatus: "banned" })).toBe(
      false,
    );
  });
});

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("rejects missing user id", async () => {
    const { requireAdmin, AccountAccessError } = await import(
      "@/lib/auth/account"
    );

    await expect(requireAdmin(undefined)).rejects.toBeInstanceOf(
      AccountAccessError,
    );
  });
});
