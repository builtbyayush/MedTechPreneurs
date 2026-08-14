"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import Link from "next/link";
import {
  Bell,
  Bookmark,
  Lock,
  LogOut,
  Palette,
  Shield,
  Trash2,
  User,
} from "lucide-react";

import { Avatar } from "@/components/features/app/avatar";
import { PageContainer } from "@/components/features/app/page-container";
import { DesktopNotificationsSetting } from "@/components/features/settings/desktop-notifications-setting";
import { SectionHeader } from "@/components/features/app/section-header";
import { ThemeToggle } from "@/components/features/theme/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useToast } from "@/hooks/use-toast";
import { getGreetingName } from "@/lib/user/display-name";
import { cn } from "@/lib/utils";
import type { BlockedUserListItem } from "@/types/block";

type SettingsPageProps = {
  user: {
    name?: string | null;
    email?: string | null;
  };
  isAdmin?: boolean;
};

export function SettingsPage({ user, isAdmin = false }: SettingsPageProps) {
  const { toast } = useToast();
  const displayName = getGreetingName(user.name, "Founder");
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserListItem[]>([]);
  const [blockedLoading, setBlockedLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const loadBlockedUsers = useCallback(async () => {
    setBlockedLoading(true);

    try {
      const response = await fetch("/api/users/blocked", { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as {
        blockedUsers?: BlockedUserListItem[];
        error?: string;
      } | null;

      if (!response.ok) {
        toast({
          title: "Could not load blocked users",
          description: payload?.error ?? "Please try again.",
          variant: "error",
        });
        setBlockedUsers([]);
        return;
      }

      setBlockedUsers(payload?.blockedUsers ?? []);
    } catch {
      toast({
        title: "Could not load blocked users",
        description: "Check your connection and try again.",
        variant: "error",
      });
      setBlockedUsers([]);
    } finally {
      setBlockedLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadBlockedUsers();
  }, [loadBlockedUsers]);

  async function unblockUser(userId: string, name: string) {
    if (unblockingId) {
      return;
    }

    setUnblockingId(userId);

    try {
      const response = await fetch(`/api/users/${userId}/block`, {
        method: "DELETE",
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;

      if (!response.ok) {
        toast({
          title: "Could not unblock user",
          description: payload?.error ?? payload?.message ?? "Please try again.",
          variant: "error",
        });
        return;
      }

      setBlockedUsers((current) => current.filter((item) => item.id !== userId));
      toast({
        title: "User unblocked",
        description: payload?.message ?? `${name} has been unblocked.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Could not unblock user",
        description: "Check your connection and try again.",
        variant: "error",
      });
    } finally {
      setUnblockingId(null);
    }
  }

  function showPlaceholder(title: string) {
    toast({
      title,
      description: "This control is a private-beta placeholder.",
    });
  }

  return (
    <PageContainer className="space-y-6 pb-28">
      <SectionHeader
        title="Settings"
        description="Account, privacy, and safety controls for private beta."
      />

      <SettingsSection title="Account" icon={User}>
        <SettingsRow label="Name" value={displayName} />
        <SettingsRow label="Email" value={user.email ?? "—"} />
        <SettingsAction
          label="Change password"
          description="Password reset flow arrives before GA."
          onClick={() => showPlaceholder("Change password")}
        />
        <Link
          href={ROUTES.logout}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full justify-start border-border bg-muted text-foreground hover:bg-muted",
          )}
        >
          <LogOut className="size-4" aria-hidden />
          Log out
        </Link>
      </SettingsSection>

      <SettingsSection title="Appearance" icon={Palette}>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/60 p-3">
          <div>
            <p className="text-sm font-medium text-foreground">Theme</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Switch between light and dark. Your choice is saved on this device.
            </p>
          </div>
          <ThemeToggle size="md" />
        </div>
      </SettingsSection>

      <SettingsSection title="Privacy & notifications" icon={Shield}>
        <DesktopNotificationsSetting />
        <SettingsAction
          label="Privacy preferences"
          description="Data export and visibility controls — coming soon."
          onClick={() => showPlaceholder("Privacy preferences")}
        />
        <div className="rounded-xl border border-border bg-muted p-3 text-sm text-muted-foreground">
          Legal:{" "}
          <Link href={ROUTES.terms} className="text-teal hover:underline">
            Terms
          </Link>
          {" · "}
          <Link href={ROUTES.privacy} className="text-teal hover:underline">
            Privacy
          </Link>
          {" · "}
          <Link href={ROUTES.cookies} className="text-teal hover:underline">
            Cookies
          </Link>
        </div>
      </SettingsSection>

      <SettingsSection title="Toolkit bookmarks" icon={Bookmark}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Saved toolkit resources will appear here. Bookmarking is a placeholder
          in private beta — browse the{" "}
          <Link href={ROUTES.app.toolkit} className="text-teal hover:underline">
            Founder&apos;s Toolkit
          </Link>
          .
        </p>
      </SettingsSection>

      <SettingsSection title="Safety" icon={Bell}>
        {isAdmin ? (
          <Link
            href={ROUTES.admin.moderation}
            className="flex items-start justify-between gap-3 rounded-xl border border-teal/30 bg-teal/10 p-3 transition-colors hover:bg-teal/15"
          >
            <div>
              <p className="text-sm font-medium text-foreground">Moderation</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Review pending user reports and take moderation actions.
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-teal">Open</span>
          </Link>
        ) : null}
        <div className="rounded-xl border border-border bg-muted p-3">
          <p className="text-sm font-medium text-foreground">Blocked users</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            People you&apos;ve blocked won&apos;t appear in Discover, Matches, or
            Messages.
          </p>

          {blockedLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
          ) : blockedUsers.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No blocked users.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {blockedUsers.map((blockedUser) => (
                <li
                  key={blockedUser.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      name={blockedUser.name}
                      imageUrl={blockedUser.profilePhotoUrl}
                      size="sm"
                    />
                    <span className="truncate text-sm font-medium text-foreground">
                      {blockedUser.name}
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0 border-border bg-transparent text-muted-foreground"
                    disabled={unblockingId === blockedUser.id}
                    onClick={() =>
                      void unblockUser(blockedUser.id, blockedUser.name)
                    }
                  >
                    {unblockingId === blockedUser.id ? "Unblocking…" : "Unblock"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Report profiles from Discover or Matches. Reports are stored for admin
          review (dashboard placeholder).
        </p>
      </SettingsSection>

      <SettingsSection title="Danger zone" icon={Trash2}>
        <SettingsAction
          label="Delete account"
          description="Permanent deletion with data export — placeholder."
          onClick={() => showPlaceholder("Delete account")}
          destructive
        />
      </SettingsSection>
    </PageContainer>
  );
}

function SettingsSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof User;
  children: ReactNode;
}) {
  return (
    <section className="founder-card-glass rounded-2xl border border-border p-4 shadow-founder-card">
      <div className="mb-4 flex items-center gap-2">
        <div className="inline-flex size-8 items-center justify-center rounded-lg border border-teal/20 bg-teal/10 text-teal-text dark:text-teal">
          <Icon className="size-4" aria-hidden />
        </div>
        <h2 className="font-heading text-base font-bold text-foreground">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[65%] text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function SettingsAction({
  label,
  description,
  onClick,
  destructive = false,
}: {
  label: string;
  description: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/60 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={cn(
              "text-sm font-medium",
              destructive ? "text-coral" : "text-foreground",
            )}
          >
            {label}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={cn(
            "shrink-0 border-border bg-transparent text-muted-foreground",
            destructive && "border-coral/30 text-coral hover:bg-coral/10",
          )}
          onClick={onClick}
        >
          <Lock className="size-3.5" aria-hidden />
          Soon
        </Button>
      </div>
    </div>
  );
}
