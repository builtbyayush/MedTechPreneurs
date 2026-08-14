import Image from "next/image";

import { CompatibilityScore } from "@/components/features/founder/compatibility-score";
import { CompatibilityReasons } from "@/components/features/founder/compatibility-reasons";
import { MatchMessageButton } from "@/components/features/matches/match-message-button";
import {
  BlockUserButton,
  ReportProfileButton,
} from "@/components/features/safety/report-profile-button";
import { ProfilePhotoPlaceholder } from "@/components/features/founder/profile-photo-placeholder";
import { SkillTag } from "@/components/features/founder/skill-tag";
import { resolveProfilePhotoSrc } from "@/lib/cloudinary/profile-photo";
import { FOUNDER_ROLE_LABELS } from "@/types/onboarding";
import type { MatchListItem } from "@/types/match";
import { cn } from "@/lib/utils";

type MatchFounderCardProps = {
  match: MatchListItem;
  className?: string;
  onBlocked?: (partnerId: string) => void;
};

function formatMatchedDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function MatchFounderCard({
  match,
  className,
  onBlocked,
}: MatchFounderCardProps) {
  const { partner } = match;
  const profilePhotoSrc = resolveProfilePhotoSrc(partner.profilePhotoUrl);

  return (
    <article
      className={cn(
        "founder-card-glass overflow-hidden rounded-2xl border border-border bg-card shadow-founder-card ring-1 ring-border ring-inset",
        className,
      )}
      aria-label={`Match with ${partner.name}`}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:p-5">
        <div className="relative mx-auto size-24 shrink-0 overflow-hidden rounded-2xl border border-border sm:mx-0 sm:size-28">
          {profilePhotoSrc ? (
            <Image
              src={profilePhotoSrc}
              alt={`Profile photo for ${partner.name}`}
              fill
              className="object-cover"
              sizes="112px"
            />
          ) : (
            <ProfilePhotoPlaceholder
              alt={`Profile photo placeholder for ${partner.name}`}
              className="size-full rounded-none"
            />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="font-heading text-lg font-extrabold tracking-tight text-foreground">
              {partner.name}
            </h3>
            {partner.headline ? (
              <p className="text-sm leading-relaxed text-teal/90">
                {partner.headline}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            <SkillTag label={FOUNDER_ROLE_LABELS[partner.founderRole]} />
            {partner.companyName ? (
              <SkillTag label={partner.companyName} />
            ) : null}
          </div>

          <div className="space-y-1 text-xs leading-relaxed text-muted-foreground">
            <p>{partner.location}</p>
            <p>
              <span className="text-muted-foreground">Matched</span>{" "}
              {formatMatchedDate(match.matchedAt)}
            </p>
          </div>

          <div className="space-y-3 border-t border-border pt-3">
            <CompatibilityScore
              score={match.compatibilityScore}
              className="rounded-xl"
            />
            <CompatibilityReasons reasons={match.compatibilityReasons} />
            {match.compatibilityExplanation ? (
              <p className="text-xs leading-relaxed text-muted-foreground">
                {match.compatibilityExplanation}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border pt-3 sm:justify-start">
            <MatchMessageButton
              conversationId={match.conversationId}
              partnerName={partner.name}
            />
            <ReportProfileButton
              reportedUserId={partner.id}
              reportedUserName={partner.name}
              onReported={() => onBlocked?.(partner.id)}
            />
            <BlockUserButton
              blockedUserId={partner.id}
              userName={partner.name}
              onBlocked={() => onBlocked?.(partner.id)}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
