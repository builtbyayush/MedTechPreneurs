import { PROFILE_PHOTO_PLACEHOLDER } from "@/constants/profile";

import type { UploadProfilePhotoInput, UploadResult } from "./types";
import { UploadNotConfiguredError } from "./types";

/** Active provider — swap to cloudinary | s3 when credentials are added. */
export const ACTIVE_STORAGE_PROVIDER = "local" as const;

/**
 * Local placeholder upload. Validates basic file constraints but does not persist
 * to disk — returns the shared placeholder URL for preview flows.
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

  if (ACTIVE_STORAGE_PROVIDER !== "local") {
    throw new UploadNotConfiguredError();
  }

  return {
    url: PROFILE_PHOTO_PLACEHOLDER,
    key: `placeholder/${input.userId}`,
    provider: "local",
  };
}

export async function uploadProfilePhotoFromUrl(url: string): Promise<UploadResult> {
  const trimmed = url.trim();

  if (!trimmed) {
    throw new Error("Image URL is required");
  }

  return {
    url: trimmed,
    provider: "local",
  };
}

export { UploadNotConfiguredError };
