import Image from "next/image";

import { resolveProfilePhotoSrc } from "@/lib/cloudinary/profile-photo";
import { cn } from "@/lib/utils";

type AvatarProps = {
  name?: string | null;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
} as const;

function getInitials(name?: string | null): string {
  if (!name?.trim()) {
    return "?";
  }

  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function Avatar({
  name,
  imageUrl,
  size = "md",
  className,
}: AvatarProps) {
  const initials = getInitials(name);
  const resolvedImageUrl = resolveProfilePhotoSrc(imageUrl);

  if (resolvedImageUrl) {
    return (
      <Image
        src={resolvedImageUrl}
        alt={name ? `${name}'s avatar` : "User avatar"}
        width={size === "sm" ? 32 : size === "md" ? 40 : 48}
        height={size === "sm" ? 32 : size === "md" ? 40 : 48}
        className={cn(
          "rounded-full border border-border object-cover ring-2 ring-teal/30",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-border bg-muted font-heading font-bold text-foreground ring-2 ring-teal/25",
        sizeClasses[size],
        className,
      )}
      aria-label={name ? `${name}'s avatar` : "User avatar"}
      role="img"
    >
      {initials}
    </div>
  );
}
