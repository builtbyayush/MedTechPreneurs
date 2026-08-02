"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

type ProfilePhotoPlaceholderProps = {
  alt: string;
  className?: string;
  aspectClassName?: string;
};

/**
 * Development-safe portrait treatment — abstract silhouette on a restrained mesh.
 * Replace with real uploads in discovery/profile flows.
 */
export function ProfilePhotoPlaceholder({
  alt,
  className,
  aspectClassName = "aspect-[3/4]",
}: ProfilePhotoPlaceholderProps) {
  const gradientId = useId();

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-[#0a1628]",
        aspectClassName,
        className,
      )}
      role="img"
      aria-label={alt}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 30% 20%, color-mix(in srgb, var(--color-teal) 22%, transparent), transparent 55%),
            radial-gradient(ellipse 70% 50% at 85% 75%, color-mix(in srgb, var(--color-deep-blue) 35%, transparent), transparent 50%),
            linear-gradient(165deg, #0a1628 0%, #0f2a47 48%, #0a1628 100%)
          `,
        }}
      />

      <div className="absolute inset-0 opacity-[0.35] landing-noise mix-blend-overlay" />

      <svg
        viewBox="0 0 360 480"
        className="absolute inset-0 size-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(255 255 255 / 0.22)" />
            <stop offset="100%" stopColor="rgb(255 255 255 / 0.06)" />
          </linearGradient>
        </defs>
        <ellipse cx="180" cy="118" rx="52" ry="58" fill={`url(#${gradientId})`} />
        <path
          d="M 88 480 Q 88 320 180 268 Q 272 320 272 480 Z"
          fill={`url(#${gradientId})`}
        />
        <path
          d="M 148 248 L 180 278 L 212 248 L 200 320 L 160 320 Z"
          fill="rgb(255 255 255 / 0.04)"
        />
      </svg>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}
