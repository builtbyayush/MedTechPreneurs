import Image from "next/image";
import { memo } from "react";

import { CompatibilityScore } from "@/components/features/founder/compatibility-score";
import { CompatibilityReasons } from "@/components/features/founder/compatibility-reasons";
import { ProfilePhotoPlaceholder } from "@/components/features/founder/profile-photo-placeholder";
import { SkillTag } from "@/components/features/founder/skill-tag";
import { EmailVerifiedBadge } from "@/components/features/founder/verified-badge";
import { DISCOVERY_CARD_PHOTO_ASPECT } from "@/constants/discovery";
import { resolveProfilePhotoSrc } from "@/lib/cloudinary/profile-photo";
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

  const profilePhotoSrc = resolveProfilePhotoSrc(founder.profilePhotoUrl);

  return (
    <article
      className={cn("w-full select-none", className)}
      aria-label={`Founder profile for ${founder.name}`}
    >
      <div className="shadow-founder-card overflow-hidden rounded-2xl border border-border bg-card ring-1 ring-border ring-inset">
        {profilePhotoSrc ? (
          <div className={cn("relative w-full", DISCOVERY_CARD_PHOTO_ASPECT)}>
            <Image
              src={profilePhotoSrc}
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
            aspectClassName={DISCOVERY_CARD_PHOTO_ASPECT}
            className="rounded-none"
          />
        )}

        <div className="space-y-3 px-5 py-4">
          <div className="space-y-1">
            <h2 className="font-heading text-[1.375rem] leading-tight font-extrabold tracking-tight text-foreground">
              {founder.name}
            </h2>
            {founder.headline ? (
              <p className="text-sm leading-snug text-teal-text dark:text-teal/90">
                {founder.headline}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-1.5">
              <SkillTag label={FOUNDER_ROLE_LABELS[founder.founderRole]} />
              {founder.verified ? <EmailVerifiedBadge /> : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <CompatibilityScore score={founder.compatibilityScore} compact />
            <CompatibilityReasons
              reasons={founder.compatibilityReasons}
              compact
            />
          </div>

          {founder.skills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {founder.skills.map((skill) => (
                <SkillTag key={skill} label={skill} />
              ))}
            </div>
          ) : null}

          {metaTags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {metaTags.map((tag) => (
                <SkillTag key={tag} label={tag} />
              ))}
            </div>
          ) : null}

          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {founder.bio}
          </p>

          <div className="space-y-0.5 border-t border-border pt-3">
            <p className="text-xs leading-snug text-muted-foreground">
              {founder.location}
            </p>
            <p className="text-xs leading-snug text-muted-foreground">
              <span className="text-muted-foreground">Looking for:</span> {lookingFor}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
});
