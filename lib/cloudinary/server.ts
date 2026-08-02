import "server-only";

import { v2 as cloudinary } from "cloudinary";

export {
  ensureCloudinaryConfigured,
  getCloudinaryConfig,
  isCloudinaryConfigured,
} from "./config";
export { createSignedUploadParams } from "./sign-upload";
export { isAllowedProfilePhotoUrl } from "./validation-server";

// Re-export cloudinary SDK access for future server-side upload/delete operations.
export { cloudinary };
