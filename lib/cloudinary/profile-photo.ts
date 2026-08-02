import { CLOUDINARY_PROFILE_PHOTO_TRANSFORM } from "@/constants/cloudinary";
import { isProfilePhotoPlaceholder } from "@/constants/profile";
import { applyCloudinaryTransform, isCloudinaryUrl } from "@/lib/cloudinary/url";

/**
 * Resolve a stored profile photo URL for display.
 * Cloudinary secure_urls are transformed; placeholders and empty values return undefined.
 */
export function resolveProfilePhotoSrc(
  photoUrl?: string | null,
  transform: string = CLOUDINARY_PROFILE_PHOTO_TRANSFORM,
): string | undefined {
  const normalized = photoUrl?.trim();

  if (!normalized || isProfilePhotoPlaceholder(normalized)) {
    return undefined;
  }

  if (isCloudinaryUrl(normalized)) {
    return applyCloudinaryTransform(normalized, transform);
  }

  return normalized;
}

export function hasRealProfilePhoto(photoUrl?: string | null): boolean {
  return Boolean(resolveProfilePhotoSrc(photoUrl));
}
