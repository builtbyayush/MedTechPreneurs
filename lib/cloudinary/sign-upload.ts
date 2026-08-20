import "server-only";

import { v2 as cloudinary } from "cloudinary";

import { ensureCloudinaryConfigured } from "@/lib/cloudinary/config";
import type {
  CloudinarySignedUploadParams,
  CloudinaryUploadSignOptions,
} from "@/lib/cloudinary/types";

/**
 * Generate signed upload parameters for direct browser → Cloudinary uploads.
 * The API secret never leaves the server.
 */
export function createSignedUploadParams(
  options: CloudinaryUploadSignOptions,
): CloudinarySignedUploadParams {
  const { cloudName, apiKey, apiSecret } = ensureCloudinaryConfigured();
  const timestamp = Math.round(Date.now() / 1000);
  const folder = options.folder.trim();
  const publicId =
    options.publicId?.trim() ||
    (options.userId ? options.userId : `upload-${timestamp}`);
  const overwrite = options.overwrite ?? true;
  const uploadType = options.type ?? "upload";
  const resourceType = options.resourceType ?? "image";

  const paramsToSign: Record<string, string | number | boolean> = {
    timestamp,
    folder,
    public_id: publicId,
    overwrite,
  };

  if (uploadType === "authenticated") {
    paramsToSign.type = "authenticated";
  }

  if (resourceType !== "image") {
    paramsToSign.resource_type = resourceType;
  }

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return {
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
    publicId,
    overwrite,
    type: uploadType,
    resourceType,
  };
}
