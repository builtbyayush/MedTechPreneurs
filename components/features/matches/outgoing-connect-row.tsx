"use client";

import { useState } from "react";

import { IntroduceYourselfDialog } from "@/components/features/matches/introduce-yourself-dialog";
import { MatchMessageButton } from "@/components/features/matches/match-message-button";
import { Avatar } from "@/components/features/app/avatar";
import { Button } from "@/components/ui/button";
import { FOUNDER_ROLE_LABELS } from "@/types/onboarding";
import type { OutgoingConnectListItem } from "@/types/match";
import { cn } from "@/lib/utils";

type OutgoingConnectRowProps = {
  connect: OutgoingConnectListItem;
  viewerFirstName?: string;
  onIntroSent?: (targetUserId: string, payload: {
    introPreview: string;
    introSentAt: string;
  }) => void;
  className?: string;
};

function formatConnectDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

const STATUS_COPY = {
  matched: {
    label: "Connected back",
    className: "border-teal/25 bg-teal/10 text-teal",
  },
  pending: {
    label: "Waiting for them",
    className: "border-border bg-muted text-muted-foreground",
  },
} as const;

export function OutgoingConnectRow({
  connect,
  viewerFirstName,
  onIntroSent,
  className,
}: OutgoingConnectRowProps) {
  const status = STATUS_COPY[connect.status];
  const { partner } = connect;
  const [dialogOpen, setDialogOpen] = useState(false);

  const showIntroAction = connect.status === "pending";
  const introSent = Boolean(connect.introSent);

  return (
    <article
      className={cn(
        "founder-card-glass flex flex-col gap-3 rounded-2xl border border-border p-4 shadow-founder-card",
        className,
      )}
      aria-label={`Connection with ${partner.name}`}
    >
      <div className="flex items-start gap-3">
        <Avatar
          name={partner.name}
          imageUrl={partner.profilePhotoUrl}
          size="lg"
          className="shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-heading text-base font-extrabold text-foreground">
                {partner.name}
              </h3>
              <p className="text-xs text-teal/85">
                {FOUNDER_ROLE_LABELS[partner.founderRole]}
              </p>
              {partner.headline ? (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {partner.headline}
                </p>
              ) : null}
            </div>

            <span
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase",
                status.className,
              )}
            >
              {status.label}
            </span>
          </div>

          <p className="mt-2 text-[11px] text-muted-foreground">
            You connected on {formatConnectDate(connect.connectedAt)}
            {connect.status === "matched" && connect.matchedAt
              ? ` · Matched ${formatConnectDate(connect.matchedAt)}`
              : null}
          </p>
        </div>
      </div>

      {showIntroAction ? (
        <div className="border-t border-border pt-3">
          {introSent ? (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-teal/90">
                Intro sent · Waiting for them
              </p>
              {connect.introPreview ? (
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  “{connect.introPreview}”
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Waiting for them to respond.
                </p>
              )}
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 border-border bg-transparent text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setDialogOpen(true)}
            >
              Introduce Yourself
            </Button>
          )}
        </div>
      ) : null}

      {connect.status === "matched" ? (
        <div className="border-t border-border pt-3">
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            You&apos;re mutually connected — start your conversation in Messages.
          </p>
          <MatchMessageButton
            conversationId={connect.conversationId}
            partnerName={partner.name}
            fullWidth
          />
        </div>
      ) : null}

      <IntroduceYourselfDialog
        targetUserId={connect.targetUserId}
        targetUserName={partner.name}
        viewerFirstName={viewerFirstName}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSent={(payload) => {
          onIntroSent?.(connect.targetUserId, payload);
        }}
      />
    </article>
  );
}
