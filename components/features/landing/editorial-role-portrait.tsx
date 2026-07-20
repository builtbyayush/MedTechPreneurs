"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

export type EditorialRole = "clinician" | "engineer" | "founder" | "investor";

type EditorialRolePortraitProps = {
  role: EditorialRole;
  className?: string;
  alt: string;
  /** scene = embedded in Scene 2 room · card = bordered tile (avoid in Scene 2) */
  variant?: "card" | "scene";
};

function RoleFigure({
  role,
  figureGradientId,
  rimGradientId,
}: {
  role: EditorialRole;
  figureGradientId: string;
  rimGradientId: string;
}) {
  const fill = `url(#${figureGradientId})`;
  const rim = `url(#${rimGradientId})`;

  switch (role) {
    case "clinician":
      return (
        <>
          <ellipse cx="80" cy="52" rx="28" ry="32" fill={fill} transform="rotate(-8 80 52)" />
          <path
            d="M 28 140 Q 28 88 80 72 Q 132 88 132 140 Z"
            fill={fill}
          />
          <path
            d="M 48 98 L 80 118 L 112 98 L 108 140 L 52 140 Z"
            fill="rgb(255 255 255 / 0.04)"
          />
          <path
            d="M 62 118 Q 80 128 98 118"
            fill="none"
            stroke="rgb(255 255 255 / 0.08)"
            strokeWidth="1"
          />
          <ellipse
            cx="80"
            cy="52"
            rx="28"
            ry="32"
            fill="none"
            stroke={rim}
            strokeWidth="0.75"
            transform="rotate(-8 80 52)"
          />
        </>
      );
    case "engineer":
      return (
        <>
          <path
            d="M 52 44 Q 80 28 108 44 L 112 58 Q 80 48 48 58 Z"
            fill="rgb(255 255 255 / 0.08)"
          />
          <ellipse cx="80" cy="58" rx="30" ry="34" fill={fill} />
          <path d="M 26 140 Q 26 86 80 78 Q 134 86 134 140 Z" fill={fill} />
          <ellipse cx="80" cy="58" rx="30" ry="34" fill="none" stroke={rim} strokeWidth="0.75" />
        </>
      );
    case "founder":
      return (
        <>
          <ellipse cx="84" cy="54" rx="28" ry="32" fill={fill} transform="rotate(6 84 54)" />
          <path d="M 30 140 Q 30 90 84 76 Q 138 90 138 140 Z" fill={fill} />
          <path
            d="M 54 108 L 84 124 L 114 108"
            fill="none"
            stroke="rgb(255 255 255 / 0.06)"
            strokeWidth="1"
          />
          <ellipse
            cx="84"
            cy="54"
            rx="28"
            ry="32"
            fill="none"
            stroke={rim}
            strokeWidth="0.75"
            transform="rotate(6 84 54)"
          />
        </>
      );
    case "investor":
      return (
        <>
          <ellipse cx="76" cy="54" rx="28" ry="32" fill={fill} transform="rotate(-4 76 54)" />
          <path d="M 28 140 Q 28 90 76 78 Q 124 90 124 140 Z" fill={fill} />
          <path
            d="M 44 112 L 44 132 M 108 112 L 108 132"
            fill="none"
            stroke="rgb(255 255 255 / 0.07)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <ellipse
            cx="76"
            cy="54"
            rx="28"
            ry="32"
            fill="none"
            stroke={rim}
            strokeWidth="0.75"
            transform="rotate(-4 76 54)"
          />
        </>
      );
  }
}

/**
 * Editorial portrait silhouette — distinct posture per co-founder role.
 * Matches Scene 1 mesh + key-light treatment.
 */
export function EditorialRolePortrait({
  role,
  className,
  alt,
  variant = "card",
}: EditorialRolePortraitProps) {
  const figureGradientId = useId();
  const rimGradientId = useId();
  const isScene = variant === "scene";

  const meshByRole: Record<EditorialRole, string> = {
    clinician: `radial-gradient(ellipse 90% 80% at 28% 16%, color-mix(in srgb, var(--color-teal) 12%, transparent), transparent 58%),
      linear-gradient(165deg, #0a1524 0%, #122840 100%)`,
    engineer: `radial-gradient(ellipse 85% 70% at 72% 14%, color-mix(in srgb, var(--color-deep-blue) 28%, transparent), transparent 55%),
      linear-gradient(155deg, #0a1524 0%, #0f2238 100%)`,
    founder: `radial-gradient(ellipse 80% 75% at 50% 12%, color-mix(in srgb, var(--color-teal) 10%, transparent), transparent 58%),
      linear-gradient(160deg, #0b1728 0%, #132842 100%)`,
    investor: `radial-gradient(ellipse 75% 70% at 38% 18%, color-mix(in srgb, var(--color-deep-blue) 22%, transparent), transparent 56%),
      linear-gradient(158deg, #0a1524 0%, #111f34 100%)`,
  };

  return (
    <div
      className={cn(
        "relative aspect-[4/5] w-full overflow-hidden",
        isScene
          ? "rounded-none bg-transparent [mask-image:linear-gradient(to_bottom,black_55%,transparent_100%)]"
          : "rounded-xl bg-[#0a1628] ring-1 ring-white/[0.07] ring-inset",
        className
      )}
      role="img"
      aria-label={alt}
    >
      {isScene ? (
        <div
          className="absolute inset-0 opacity-70"
          style={{ background: meshByRole[role] }}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: meshByRole[role] }} />
      )}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 28% 22%, rgb(255 255 255 / 0.06), transparent 55%)",
        }}
      />
      <div className={cn("absolute inset-0 landing-noise mix-blend-overlay", isScene ? "opacity-[0.12]" : "opacity-[0.18]")} />
      {!isScene ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 95% 88% at 50% 42%, transparent 40%, rgb(0 0 0 / 0.32) 100%)",
          }}
        />
      ) : null}

      <svg
        viewBox="0 0 160 160"
        className="absolute inset-0 size-full px-2 pt-3"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <linearGradient id={figureGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(255 255 255 / 0.26)" />
            <stop offset="55%" stopColor="rgb(255 255 255 / 0.14)" />
            <stop offset="100%" stopColor="rgb(255 255 255 / 0.05)" />
          </linearGradient>
          <linearGradient id={rimGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(255 255 255 / 0.12)" />
            <stop offset="100%" stopColor="rgb(255 255 255 / 0)" />
          </linearGradient>
        </defs>
        <RoleFigure
          role={role}
          figureGradientId={figureGradientId}
          rimGradientId={rimGradientId}
        />
      </svg>

      {!isScene ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      ) : null}
    </div>
  );
}
