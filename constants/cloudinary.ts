/** Cloudinary asset folders — extend for verification docs, toolkit assets, chat attachments. */
export const CLOUDINARY_FOLDERS = {
  profileImages: "splice/profile-images",
} as const;

/** Default delivery transform for profile photos in cards and avatars. */
export const CLOUDINARY_PROFILE_PHOTO_TRANSFORM =
  "f_auto,q_auto,w_400,c_fill,g_face" as const;

export const PROFILE_PHOTO_UPLOAD = {
  maxFileSizeBytes: 5 * 1024 * 1024,
  maxDimension: 800,
  /** Target ~200–300 KB after client-side compression. */
  targetMaxSizeMB: 0.28,
  acceptedMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ] as const,
} as const;
