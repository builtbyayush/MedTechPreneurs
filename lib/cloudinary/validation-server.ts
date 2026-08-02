import "server-only";

import {
  getCloudinaryConfig,
  isCloudinaryConfigured,
} from "@/lib/cloudinary/config";
import { isCloudinaryUrlForCloud } from "@/lib/cloudinary/url";
import { isAllowedProfilePhotoUrl as isAllowedProfilePhotoUrlShared } from "@/lib/cloudinary/validation-shared";

/** Server-side validation — also verifies the URL belongs to this Cloudinary cloud. */
export function isAllowedProfilePhotoUrl(url: string): boolean {
  if (!isAllowedProfilePhotoUrlShared(url)) {
    return false;
  }

  const trimmed = url.trim();

  if (!trimmed || trimmed.startsWith("/")) {
    return true;
  }

  if (!isCloudinaryConfigured()) {
    return trimmed.startsWith("http");
  }

  try {
    const { cloudName } = getCloudinaryConfig();
    return isCloudinaryUrlForCloud(trimmed, cloudName);
  } catch {
    return false;
  }
}
