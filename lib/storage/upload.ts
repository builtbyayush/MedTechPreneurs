import type { UploadProfilePhotoInput, UploadResult } from "./types";
import { UploadNotConfiguredError } from "./types";

/** Active provider — profile photos use signed Cloudinary uploads from the client. */
export const ACTIVE_STORAGE_PROVIDER = "cloudinary" as const;

/**
 * @deprecated Profile photos upload directly to Cloudinary from the browser.
 * Use `/api/uploads/cloudinary/sign` + `lib/client/upload-profile-photo.ts`.
 */
export async function uploadProfilePhoto(
  input: UploadProfilePhotoInput,
): Promise<UploadResult> {
  const { file } = input;

  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be 5 MB or smaller");
  }

  throw new UploadNotConfiguredError(
    "Use the profile photo upload flow (signed Cloudinary upload).",
  );
}

export async function uploadProfilePhotoFromUrl(url: string): Promise<UploadResult> {
  const trimmed = url.trim();

  if (!trimmed) {
    throw new Error("Image URL is required");
  }

  return {
    url: trimmed,
    provider: "cloudinary",
  };
}

export { UploadNotConfiguredError };
