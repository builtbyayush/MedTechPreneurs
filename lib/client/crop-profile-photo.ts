import imageCompression from "browser-image-compression";
import type { Area } from "react-easy-crop";

import {
  PROFILE_PHOTO_CROP,
  PROFILE_PHOTO_UPLOAD,
} from "@/constants/cloudinary";
import { validateProfilePhotoFile } from "@/lib/client/compress-profile-photo";

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () =>
      reject(new Error("Unable to read this image. Try another file.")),
    );
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}

/**
 * HEIC/HEIF may not render in canvas — normalize to JPEG for the crop editor only.
 */
export async function prepareProfilePhotoCropSource(file: File): Promise<string> {
  validateProfilePhotoFile(file);

  const needsConversion =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    !file.type.startsWith("image/");

  if (!needsConversion) {
    return URL.createObjectURL(file);
  }

  const converted = await imageCompression(file, {
    maxSizeMB: PROFILE_PHOTO_UPLOAD.maxFileSizeBytes / (1024 * 1024),
    maxWidthOrHeight: 2400,
    useWebWorker: true,
    fileType: "image/jpeg",
    initialQuality: 0.92,
  });

  return URL.createObjectURL(converted);
}

export async function renderCroppedProfilePhoto(
  imageSrc: string,
  pixelCrop: Area,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to process this image. Please try again.");
  }

  canvas.width = PROFILE_PHOTO_CROP.outputWidth;
  canvas.height = PROFILE_PHOTO_CROP.outputHeight;

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    PROFILE_PHOTO_CROP.outputWidth,
    PROFILE_PHOTO_CROP.outputHeight,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to process this image. Please try again."));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      0.92,
    );
  });
}

export function croppedBlobToFile(blob: Blob, originalName: string): File {
  const baseName = originalName.replace(/\.[^.]+$/, "") || "profile-photo";
  return new File([blob], `${baseName}-cropped.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

export function revokeObjectUrl(url: string | null | undefined): void {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}
