import { CLOUDINARY_FOLDERS } from "@/constants/cloudinary";
import { PROFILE_PHOTO_PLACEHOLDER } from "@/constants/profile";
import { isCloudinaryUrl } from "@/lib/cloudinary/url";

export function getPublicIdPathFromSecureUrl(secureUrl: string): string | null {
  try {
    const parsed = new URL(secureUrl);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const uploadIndex = segments.indexOf("upload");

    if (uploadIndex === -1) {
      return null;
    }

    let remainder = segments.slice(uploadIndex + 1);

    if (remainder[0]?.startsWith("v") && /^v\d+$/.test(remainder[0])) {
      remainder = remainder.slice(1);
    }

    while (
      remainder[0] &&
      (remainder[0].includes(",") || /^(w_|h_|c_|g_|f_|q_|ar_)/.test(remainder[0]))
    ) {
      remainder = remainder.slice(1);
    }

    if (remainder.length === 0) {
      return null;
    }

    const last = remainder[remainder.length - 1] ?? "";
    const withoutExt = last.includes(".")
      ? last.slice(0, last.lastIndexOf("."))
      : last;

    return remainder.length > 1
      ? `${remainder.slice(0, -1).join("/")}/${withoutExt}`
      : withoutExt;
  } catch {
    return null;
  }
}

/** Client-safe URL validation — no Node SDK or env access. */
export function isAllowedProfilePhotoUrl(url: string): boolean {
  const trimmed = url.trim();

  if (!trimmed) {
    return true;
  }

  if (trimmed === PROFILE_PHOTO_PLACEHOLDER) {
    return true;
  }

  if (trimmed.startsWith("/")) {
    return true;
  }

  if (!isCloudinaryUrl(trimmed)) {
    return false;
  }

  const publicIdPath = getPublicIdPathFromSecureUrl(trimmed);
  if (!publicIdPath) {
    return false;
  }

  return (
    publicIdPath === CLOUDINARY_FOLDERS.profileImages ||
    publicIdPath.startsWith(`${CLOUDINARY_FOLDERS.profileImages}/`)
  );
}
