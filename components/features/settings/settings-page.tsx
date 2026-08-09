"use client";

import type { ReactNode } from "react";

import Link from "next/link";
import {
  Bell,
  Bookmark,
  Lock,
  LogOut,
  Shield,
  Trash2,
  User,
} from "lucide-react";

import { PageContainer } from "@/components/features/app/page-container";
import { DesktopNotificationsSetting } from "@/components/features/settings/desktop-notifications-setting";
import { SectionHeader } from "@/components/features/app/section-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useToast } from "@/hooks/use-toast";
import { getGreetingName } from "@/lib/user/display-name";
import { cn } from "@/lib/utils";

type SettingsPageProps = {
  user: {
    name?: string | null;
    email?: string | null;
  };
};

export function SettingsPage({ user }: SettingsPageProps) {
  const { toast } = useToast();
  const displayName = getGreetingName(user.name, "Founder");

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
            "w-full justify-start border-white/15 bg-white/[0.03] text-white hover:bg-white/[0.06]",
          )}
        >
          <LogOut className="size-4" aria-hidden />
          Log out
        </Link>
      </SettingsSection>

      <SettingsSection title="Privacy & notifications" icon={Shield}>
        <DesktopNotificationsSetting />
        <SettingsAction
          label="Privacy preferences"
          description="Data export and visibility controls — coming soon."
          onClick={() => showPlaceholder("Privacy preferences")}
        />
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/55">
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
        <p className="text-sm leading-relaxed text-white/55">
          Saved toolkit resources will appear here. Bookmarking is a placeholder
          in private beta — browse the{" "}
          <Link href={ROUTES.app.toolkit} className="text-teal hover:underline">
            Founder&apos;s Toolkit
          </Link>
          .
        </p>
      </SettingsSection>

      <SettingsSection title="Safety" icon={Bell}>
        <SettingsAction
          label="Blocked users"
          description="Block list management — placeholder until moderation ships."
          onClick={() => showPlaceholder("Blocked users")}
        />
        <p className="text-xs leading-relaxed text-white/45">
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
    <section className="founder-card-glass rounded-2xl border border-white/10 p-4 shadow-founder-card">
      <div className="mb-4 flex items-center gap-2">
        <div className="inline-flex size-8 items-center justify-center rounded-lg border border-teal/20 bg-teal/10 text-teal">
          <Icon className="size-4" aria-hidden />
        </div>
        <h2 className="font-heading text-base font-bold text-white">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-white/45">{label}</span>
      <span className="max-w-[65%] text-right font-medium text-white">{value}</span>
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
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={cn(
              "text-sm font-medium",
              destructive ? "text-coral" : "text-white",
            )}
          >
            {label}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-white/50">
            {description}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={cn(
            "shrink-0 border-white/15 bg-transparent text-white/80",
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
