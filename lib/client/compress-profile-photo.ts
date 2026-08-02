import imageCompression from "browser-image-compression";

import { PROFILE_PHOTO_UPLOAD } from "@/constants/cloudinary";

export class ProfilePhotoValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfilePhotoValidationError";
  }
}

export function validateProfilePhotoFile(file: File): void {
  if (file.type && !file.type.startsWith("image/")) {
    throw new ProfilePhotoValidationError("Please choose an image file.");
  }

  if (
    file.type &&
    PROFILE_PHOTO_UPLOAD.acceptedMimeTypes.length > 0 &&
    !PROFILE_PHOTO_UPLOAD.acceptedMimeTypes.includes(
      file.type as (typeof PROFILE_PHOTO_UPLOAD.acceptedMimeTypes)[number],
    )
  ) {
    throw new ProfilePhotoValidationError(
      "Use a JPEG, PNG, or WebP image.",
    );
  }

  if (file.size > PROFILE_PHOTO_UPLOAD.maxFileSizeBytes) {
    throw new ProfilePhotoValidationError("Image must be 5 MB or smaller.");
  }
}

/** Compress and resize before Cloudinary upload (~200–300 KB, max 800×800). */
export async function compressProfilePhoto(file: File): Promise<File> {
  validateProfilePhotoFile(file);

  const compressed = await imageCompression(file, {
    maxSizeMB: PROFILE_PHOTO_UPLOAD.targetMaxSizeMB,
    maxWidthOrHeight: PROFILE_PHOTO_UPLOAD.maxDimension,
    useWebWorker: true,
    fileType: "image/jpeg",
    initialQuality: 0.82,
  });

  return compressed;
}
