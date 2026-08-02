import { CLOUDINARY_PROFILE_PHOTO_TRANSFORM } from "@/constants/cloudinary";

const CLOUDINARY_HOST = "res.cloudinary.com";

export function isCloudinaryUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === CLOUDINARY_HOST;
  } catch {
    return false;
  }
}

export function isCloudinaryUrlForCloud(url: string, cloudName: string): boolean {
  if (!isCloudinaryUrl(url)) {
    return false;
  }

  try {
    const parsed = new URL(url);
    const [, cloudSegment] = parsed.pathname.split("/");
    return cloudSegment === cloudName;
  } catch {
    return false;
  }
}

/**
 * Insert delivery transforms into a Cloudinary secure_url (pure string — safe on client).
 */
export function applyCloudinaryTransform(
  secureUrl: string,
  transform: string = CLOUDINARY_PROFILE_PHOTO_TRANSFORM,
): string {
  const uploadMarker = "/upload/";
  const markerIndex = secureUrl.indexOf(uploadMarker);

  if (markerIndex === -1) {
    return secureUrl;
  }

  const prefix = secureUrl.slice(0, markerIndex + uploadMarker.length);
  const suffix = secureUrl.slice(markerIndex + uploadMarker.length);

  if (suffix.startsWith(`${transform}/`)) {
    return secureUrl;
  }

  return `${prefix}${transform}/${suffix}`;
}

/** Alias for applyCloudinaryTransform — builds an optimized delivery URL from secure_url. */
export function buildCloudinaryDeliveryUrl(
  secureUrl: string,
  transform: string = CLOUDINARY_PROFILE_PHOTO_TRANSFORM,
): string {
  return applyCloudinaryTransform(secureUrl, transform);
}
