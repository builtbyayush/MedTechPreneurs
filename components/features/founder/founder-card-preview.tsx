import type { FounderCategory } from "@/components/features/founder/category-badge";
import { CategoryBadge } from "@/components/features/founder/category-badge";
import { CompatibilityScore } from "@/components/features/founder/compatibility-score";
import { ProfilePhotoPlaceholder } from "@/components/features/founder/profile-photo-placeholder";
import { SkillTag } from "@/components/features/founder/skill-tag";
import { VerifiedBadge } from "@/components/features/founder/verified-badge";
import { cn } from "@/lib/utils";

export type FounderCardPreviewProps = {
  name: string;
  category: FounderCategory;
  verified?: boolean;
  compatibilityScore: number;
  skillTags: string[];
  location: string;
  lookingFor: string[];
  exampleCaption?: boolean;
  className?: string;
};

export function FounderCardPreview({
  name,
  category,
  verified = true,
  compatibilityScore,
  skillTags,
  location,
  lookingFor,
  exampleCaption = true,
  className,
}: FounderCardPreviewProps) {
  return (
    <figure
      className={cn("w-full cursor-default select-none", className)}
      aria-label={`Example founder profile for ${name}`}
    >
      <div className="shadow-founder-card overflow-hidden rounded-2xl border border-border bg-card ring-1 ring-border ring-inset">
        <ProfilePhotoPlaceholder
          alt={`Profile photo placeholder for ${name}`}
          className="rounded-none"
        />

        <div className="space-y-5 p-6 pt-5">
          <div className="space-y-3">
            <h2 className="font-heading text-[1.375rem] leading-tight font-extrabold tracking-tight text-foreground">
              {name}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={category} />
              {verified ? <VerifiedBadge /> : null}
            </div>
          </div>

          <CompatibilityScore score={compatibilityScore} />

          <div className="flex flex-wrap gap-2">
            {skillTags.map((tag) => (
              <SkillTag key={tag} label={tag} />
            ))}
          </div>

          <div className="space-y-1 border-t border-border pt-4">
            <p className="text-xs leading-relaxed text-muted-foreground">{location}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="text-muted-foreground">Looking for:</span>{" "}
              {lookingFor.join(", ")}
            </p>
          </div>

          <div
            className="flex items-center justify-between rounded-lg border border-border bg-muted px-4 py-3"
            aria-hidden
          >
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Pass
            </span>
            <span className="font-heading text-xs font-bold tracking-wide text-coral/75 uppercase">
              Connect
            </span>
          </div>
        </div>
      </div>

      {exampleCaption ? (
        <figcaption className="mt-4 text-center text-[11px] tracking-wide text-muted-foreground">
          Example profile
        </figcaption>
      ) : null}
    </figure>
  );
}
