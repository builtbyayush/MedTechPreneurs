import Image from "next/image";
import { memo } from "react";

import { CompatibilityScore } from "@/components/features/founder/compatibility-score";
import { CompatibilityReasons } from "@/components/features/founder/compatibility-reasons";
import { ProfilePhotoPlaceholder } from "@/components/features/founder/profile-photo-placeholder";
import { SkillTag } from "@/components/features/founder/skill-tag";
import { VerifiedBadge } from "@/components/features/founder/verified-badge";
import { isProfilePhotoPlaceholder } from "@/constants/profile";
import {
  BUILDING_TYPE_LABELS,
  CURRENT_STAGE_LABELS,
  FOUNDER_ROLE_LABELS,
  LOOKING_FOR_ROLE_LABELS,
} from "@/types/onboarding";
import type { DiscoveryFounder } from "@/types/discovery";
import { cn } from "@/lib/utils";

type DiscoveryFounderCardProps = {
  founder: DiscoveryFounder;
  className?: string;
};

export const DiscoveryFounderCard = memo(function DiscoveryFounderCard({
  founder,
  className,
}: DiscoveryFounderCardProps) {
  const lookingFor =
    founder.lookingForRoles.length > 0
      ? founder.lookingForRoles
          .map((role) => LOOKING_FOR_ROLE_LABELS[role])
          .join(", ")
      : "Open to co-founder conversations";

  const metaTags = [
    founder.companyName,
    founder.yearsExperience !== undefined
      ? `${founder.yearsExperience} yrs experience`
      : undefined,
    BUILDING_TYPE_LABELS[founder.buildingFocus],
    CURRENT_STAGE_LABELS[founder.currentStage],
  ].filter(Boolean) as string[];

  return (
    <article
      className={cn("w-full select-none", className)}
      aria-label={`Founder profile for ${founder.name}`}
    >
      <div className="shadow-founder-card overflow-hidden rounded-2xl border border-white/[0.12] bg-ink-elevated ring-1 ring-white/[0.06] ring-inset">
        {founder.profilePhotoUrl &&
        !isProfilePhotoPlaceholder(founder.profilePhotoUrl) ? (
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={founder.profilePhotoUrl}
              alt={`Profile photo for ${founder.name}`}
              fill
              className="object-cover"
              sizes="(max-width: 512px) 100vw, 512px"
              priority
            />
          </div>
        ) : (
          <ProfilePhotoPlaceholder
            alt={`Profile photo placeholder for ${founder.name}`}
            className="rounded-none"
          />
        )}

        <div className="space-y-5 p-6 pt-5">
          <div className="space-y-2">
            <h2 className="font-heading text-[1.375rem] leading-tight font-extrabold tracking-tight text-white">
              {founder.name}
            </h2>
            {founder.headline ? (
              <p className="text-sm leading-relaxed text-teal/90">
                {founder.headline}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <SkillTag label={FOUNDER_ROLE_LABELS[founder.founderRole]} />
              {founder.verified ? (
                <VerifiedBadge />
              ) : (
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold tracking-wide text-white/45 uppercase">
                  Verification pending
                </span>
              )}
            </div>
          </div>

          <CompatibilityScore score={founder.compatibilityScore} />
          <CompatibilityReasons reasons={founder.compatibilityReasons} />

          {founder.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {founder.skills.map((skill) => (
                <SkillTag key={skill} label={skill} />
              ))}
            </div>
          ) : null}

          {metaTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {metaTags.map((tag) => (
                <SkillTag key={tag} label={tag} />
              ))}
            </div>
          ) : null}

          <p className="text-sm leading-relaxed text-white/65">{founder.bio}</p>

          <div className="space-y-1 border-t border-white/[0.08] pt-4">
            <p className="text-xs leading-relaxed text-white/55">
              {founder.location}
            </p>
            <p className="text-xs leading-relaxed text-white/70">
              <span className="text-white/45">Looking for:</span> {lookingFor}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
});
