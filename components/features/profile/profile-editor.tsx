"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { PageContainer } from "@/components/features/app/page-container";
import { SectionHeader } from "@/components/features/app/section-header";
import {
  authFieldClassName,
  authLabelClassName,
} from "@/components/features/auth/auth-shell";
import { ProfileFounderFields } from "@/components/features/profile/profile-founder-fields";
import { ProfileSection } from "@/components/features/profile/profile-section";
import { CompatibilityExplainer } from "@/components/features/profile/compatibility-explainer";
import { ProfilePhotoPlaceholder } from "@/components/features/founder/profile-photo-placeholder";
import { ProfilePhotoUpload } from "@/components/features/profile/profile-photo-upload";
import { SkillTag } from "@/components/features/founder/skill-tag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PROFILE_LIMITS,
} from "@/constants/profile";
import { ROUTES } from "@/constants/routes";
import { useToast } from "@/hooks/use-toast";
import { resolveProfilePhotoSrc } from "@/lib/cloudinary/profile-photo";
import { INDIA_COUNTRY_NAME, findStateForCityName } from "@/lib/locations/india";
import { profileUpdateSchema } from "@/lib/validations/profile";
import type { FounderProfile } from "@/types/profile";
import { cn } from "@/lib/utils";

type ProfileFormValues = z.infer<typeof profileUpdateSchema>;

type ProfileEditorProps = {
  initialProfile: FounderProfile;
  isAdmin?: boolean;
};

function resolveInitialLocation(profile: FounderProfile): {
  country: string;
  state: string;
  city: string;
} {
  const country = profile.country || INDIA_COUNTRY_NAME;
  const city = profile.city ?? "";
  const state =
    profile.state ||
    (city ? findStateForCityName(city)?.name : undefined) ||
    "";

  return { country, state, city };
}

export function ProfileEditor({
  initialProfile,
  isAdmin = false,
}: ProfileEditorProps) {
  const { toast } = useToast();
  const [skillInput, setSkillInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const initialLocation = resolveInitialLocation(initialProfile);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      profilePhotoUrl: initialProfile.profilePhotoUrl ?? "",
      headline: initialProfile.headline ?? "",
      bio: initialProfile.bio ?? "",
      skills: initialProfile.skills ?? [],
      yearsExperience: initialProfile.yearsExperience,
      companyName: initialProfile.companyName ?? "",
      linkedinUrl: initialProfile.linkedinUrl ?? "",
      websiteUrl: initialProfile.websiteUrl ?? "",
      founderRole: initialProfile.founderRole,
      buildingFocus: initialProfile.buildingFocus,
      currentStage: initialProfile.currentStage,
      lookingForRoles: initialProfile.lookingForRoles ?? [],
      country: initialLocation.country,
      state: initialLocation.state,
      city: initialLocation.city,
    },
  });

  const skills = form.watch("skills");
  const profilePhotoUrl = form.watch("profilePhotoUrl");
  const profilePhotoSrc = resolveProfilePhotoSrc(profilePhotoUrl);
  const { isDirty } = form.formState;

  function addSkill() {
    const value = skillInput.trim();
    if (!value) {
      return;
    }

    const current = form.getValues("skills");

    if (current.length >= PROFILE_LIMITS.maxSkills) {
      form.setError("skills", {
        message: `You can add up to ${PROFILE_LIMITS.maxSkills} skills`,
      });
      return;
    }

    if (current.some((skill) => skill.toLowerCase() === value.toLowerCase())) {
      setSkillInput("");
      return;
    }

    form.setValue("skills", [...current, value], {
      shouldValidate: true,
      shouldDirty: true,
    });
    setSkillInput("");
    form.clearErrors("skills");
  }

  function removeSkill(index: number) {
    const current = form.getValues("skills");
    form.setValue(
      "skills",
      current.filter((_, itemIndex) => itemIndex !== index),
      { shouldValidate: true, shouldDirty: true },
    );
  }

  async function onSubmit(values: ProfileFormValues) {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;

      if (!response.ok) {
        toast({
          title: "Could not save profile",
          description:
            payload?.message ?? payload?.error ?? "Please try again.",
          variant: "error",
        });
        setIsSaving(false);
        return;
      }

      toast({
        title: "Profile saved",
        description: "Your founder profile is updated on Discovery.",
        variant: "success",
      });
      form.reset(values);
    } catch {
      toast({
        title: "Could not save profile",
        description: "Something went wrong. Please try again.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageContainer className={cn("space-y-6 pt-2", isDirty ? "pb-24" : "pb-8")}>
      <SectionHeader
        title="Profile"
        description="Shape how other founders see you in Discovery."
      />

      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <ProfileSection
          title="Profile header"
          description="Your public introduction on founder cards."
        >
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-border">
              {profilePhotoSrc ? (
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src={profilePhotoSrc}
                    alt={`Profile photo for ${initialProfile.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 512px) 100vw, 512px"
                  />
                </div>
              ) : (
                <ProfilePhotoPlaceholder
                  alt={`Profile photo placeholder for ${initialProfile.name}`}
                  className="rounded-none"
                />
              )}
            </div>

            <ProfilePhotoUpload
              hasPhoto={Boolean(profilePhotoSrc)}
              disabled={isSaving}
              onPhotoChange={(secureUrl) => {
                form.setValue("profilePhotoUrl", secureUrl ?? "", {
                  shouldDirty: false,
                });
              }}
            />

            <div className="space-y-2">
              <label className={authLabelClassName} htmlFor="profile-name">
                Full name
              </label>
              <Input
                id="profile-name"
                value={initialProfile.name}
                disabled
                className={cn(authFieldClassName, "opacity-70")}
              />
            </div>

            <div className="space-y-2">
              <label className={authLabelClassName} htmlFor="profile-headline">
                Headline
              </label>
              <Input
                id="profile-headline"
                placeholder="Building AI diagnostics for rural clinics"
                className={authFieldClassName}
                aria-invalid={!!form.formState.errors.headline}
                {...form.register("headline")}
              />
              {form.formState.errors.headline ? (
                <p className="text-sm text-coral" role="alert">
                  {form.formState.errors.headline.message}
                </p>
              ) : null}
            </div>
          </div>
        </ProfileSection>

        <ProfileSection title="About" description="Tell founders what drives you.">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={authLabelClassName} htmlFor="profile-bio">
                Short bio
              </label>
              <textarea
                id="profile-bio"
                rows={4}
                placeholder="Share your mission, background, and what you want in a co-founder."
                className={cn(
                  authFieldClassName,
                  "min-h-28 w-full resize-y rounded-lg px-3 py-2.5 text-sm",
                )}
                aria-invalid={!!form.formState.errors.bio}
                {...form.register("bio")}
              />
              {form.formState.errors.bio ? (
                <p className="text-sm text-coral" role="alert">
                  {form.formState.errors.bio.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                className={authLabelClassName}
                htmlFor="profile-experience"
              >
                Years of experience
              </label>
              <Input
                id="profile-experience"
                type="number"
                min={0}
                max={PROFILE_LIMITS.maxExperience}
                className={authFieldClassName}
                aria-invalid={!!form.formState.errors.yearsExperience}
                {...form.register("yearsExperience", {
                  setValueAs: (value) =>
                    value === "" || Number.isNaN(Number(value))
                      ? undefined
                      : Number(value),
                })}
              />
              {form.formState.errors.yearsExperience ? (
                <p className="text-sm text-coral" role="alert">
                  {form.formState.errors.yearsExperience.message}
                </p>
              ) : null}
            </div>
          </div>
        </ProfileSection>

        <ProfileSection
          title="Startup"
          description="What venture are you building?"
        >
          <div className="space-y-2">
            <label className={authLabelClassName} htmlFor="profile-company">
              Startup / company name
            </label>
            <Input
              id="profile-company"
              placeholder="PulseBridge Health"
              className={authFieldClassName}
              aria-invalid={!!form.formState.errors.companyName}
              {...form.register("companyName")}
            />
            {form.formState.errors.companyName ? (
              <p className="text-sm text-coral" role="alert">
                {form.formState.errors.companyName.message}
              </p>
            ) : null}
          </div>
        </ProfileSection>

        <ProfileSection
          title="Skills"
          description={`Add up to ${PROFILE_LIMITS.maxSkills} strengths.`}
        >
          <div className="space-y-3">
            <div className="flex gap-2">
              <label className="sr-only" htmlFor="profile-skill-input">
                Add a skill
              </label>
              <Input
                id="profile-skill-input"
                value={skillInput}
                onChange={(event) => setSkillInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Regulatory, AI/ML, GTM"
                className={authFieldClassName}
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0 border-border bg-muted text-foreground"
                onClick={addSkill}
              >
                Add
              </Button>
            </div>

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <button
                    key={`${skill}-${index}`}
                    type="button"
                    className="group inline-flex items-center gap-2"
                    onClick={() => removeSkill(index)}
                    aria-label={`Remove ${skill}`}
                  >
                    <SkillTag label={skill} />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No skills added yet. Add a few to stand out in Discovery.
              </p>
            )}

            {form.formState.errors.skills ? (
              <p className="text-sm text-coral" role="alert">
                {form.formState.errors.skills.message}
              </p>
            ) : null}
          </div>
        </ProfileSection>

        <ProfileSection title="Links" description="Help founders learn more.">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={authLabelClassName} htmlFor="profile-linkedin">
                LinkedIn URL
              </label>
              <Input
                id="profile-linkedin"
                type="url"
                placeholder="https://linkedin.com/in/your-handle"
                className={authFieldClassName}
                aria-invalid={!!form.formState.errors.linkedinUrl}
                {...form.register("linkedinUrl")}
              />
              {form.formState.errors.linkedinUrl ? (
                <p className="text-sm text-coral" role="alert">
                  {form.formState.errors.linkedinUrl.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className={authLabelClassName} htmlFor="profile-website">
                Personal website (optional)
              </label>
              <Input
                id="profile-website"
                type="url"
                placeholder="https://yourdomain.com"
                className={authFieldClassName}
                aria-invalid={!!form.formState.errors.websiteUrl}
                {...form.register("websiteUrl")}
              />
              {form.formState.errors.websiteUrl ? (
                <p className="text-sm text-coral" role="alert">
                  {form.formState.errors.websiteUrl.message}
                </p>
              ) : null}
            </div>
          </div>
        </ProfileSection>

        <ProfileSection
          title="Founder profile"
          description="Role, stage, and location drive compatibility scoring."
        >
          <ProfileFounderFields form={form} />
        </ProfileSection>

        <ProfileSection
          title="How compatibility is calculated"
          description="Scores update instantly when your founder profile changes."
        >
          <CompatibilityExplainer />
        </ProfileSection>

        <ProfileSection title="Account">
          <div className="space-y-2 text-sm">
            <SnapshotRow label="Email" value={initialProfile.email} />
            {isAdmin ? (
              <Link
                href={ROUTES.admin.moderation}
                className="flex w-full items-center justify-between rounded-xl border border-teal/30 bg-teal/10 px-3 py-3 font-semibold text-teal transition-colors hover:bg-teal/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              >
                <span>Admin moderation</span>
                <span className="text-xs font-medium text-teal/80">
                  Review reports
                </span>
              </Link>
            ) : null}
            <Link
              href={ROUTES.app.settings}
              className="flex w-full items-center rounded-xl border border-border bg-muted px-3 py-3 font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            >
              Account settings
            </Link>
            {/* Founder's Toolkit deferred — see TOOLKIT_ENABLED in constants/features.ts */}
            <Link
              href={ROUTES.logout}
              className="flex w-full items-center rounded-xl border border-border bg-muted px-3 py-3 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            >
              Log out
            </Link>
          </div>
        </ProfileSection>

        {isDirty ? (
          <div className="sticky bottom-0 z-20 -mx-1 border-t border-border bg-background/95 px-1 pt-3 pb-3 backdrop-blur-md">
            <Button
              type="submit"
              disabled={isSaving}
              aria-busy={isSaving}
              className="h-12 w-full bg-teal font-extrabold text-ink shadow-brutal-teal hover:bg-teal/80 disabled:opacity-60"
            >
              {isSaving ? "Saving profile…" : "Save profile"}
            </Button>
          </div>
        ) : null}
      </form>
    </PageContainer>
  );
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="max-w-[65%] text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}
