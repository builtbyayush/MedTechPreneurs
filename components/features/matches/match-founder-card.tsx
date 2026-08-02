import Image from "next/image";

import { CompatibilityScore } from "@/components/features/founder/compatibility-score";
import { CompatibilityReasons } from "@/components/features/founder/compatibility-reasons";
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
};

function formatMatchedDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function MatchFounderCard({ match, className }: MatchFounderCardProps) {
  const { partner } = match;
  const profilePhotoSrc = resolveProfilePhotoSrc(partner.profilePhotoUrl);

  return (
    <article
      className={cn(
        "founder-card-glass overflow-hidden rounded-2xl border border-white/[0.12] bg-ink-elevated shadow-founder-card ring-1 ring-white/[0.06] ring-inset",
        className,
      )}
      aria-label={`Match with ${partner.name}`}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:p-5">
        <div className="relative mx-auto size-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 sm:mx-0 sm:size-28">
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
            <h3 className="font-heading text-lg font-extrabold tracking-tight text-white">
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

          <div className="space-y-1 text-xs leading-relaxed text-white/60">
            <p>{partner.location}</p>
            <p>
              <span className="text-white/45">Matched</span>{" "}
              {formatMatchedDate(match.matchedAt)}
            </p>
          </div>

          <div className="space-y-3 border-t border-white/[0.08] pt-3">
            <CompatibilityScore
              score={match.compatibilityScore}
              className="rounded-xl"
            />
            <CompatibilityReasons reasons={match.compatibilityReasons} />
            {match.compatibilityExplanation ? (
              <p className="text-xs leading-relaxed text-white/50">
                {match.compatibilityExplanation}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1 border-t border-white/[0.08] pt-3 sm:justify-start">
            <ReportProfileButton
              reportedUserId={partner.id}
              reportedUserName={partner.name}
            />
            <BlockUserButton userName={partner.name} />
          </div>
        </div>
      </div>
    </article>
  );
}
