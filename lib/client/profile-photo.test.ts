import { describe, expect, it } from "vitest";

import {
  PROFILE_PHOTO_CROP,
  PROFILE_PHOTO_UPLOAD,
} from "@/constants/cloudinary";
import {
  ProfilePhotoValidationError,
  validateProfilePhotoFile,
} from "@/lib/client/compress-profile-photo";
import { croppedBlobToFile, revokeObjectUrl } from "@/lib/client/crop-profile-photo";

describe("validateProfilePhotoFile", () => {
  it("accepts valid JPEG images within size limits", () => {
    const file = new File(["image-bytes"], "photo.jpg", {
      type: "image/jpeg",
    });
    Object.defineProperty(file, "size", { value: 1024 });

    expect(() => validateProfilePhotoFile(file)).not.toThrow();
  });

  it("rejects non-image files", () => {
    const file = new File(["text"], "notes.txt", { type: "text/plain" });

    expect(() => validateProfilePhotoFile(file)).toThrow(
      ProfilePhotoValidationError,
    );
    expect(() => validateProfilePhotoFile(file)).toThrow(
      "Please choose an image file.",
    );
  });

  it("rejects unsupported image types", () => {
    const file = new File(["gif"], "photo.gif", { type: "image/gif" });

    expect(() => validateProfilePhotoFile(file)).toThrow(
      "Use a JPEG, PNG, or WebP image.",
    );
  });

  it("rejects oversized files", () => {
    const file = new File(["large"], "large.jpg", { type: "image/jpeg" });
    Object.defineProperty(file, "size", {
      value: PROFILE_PHOTO_UPLOAD.maxFileSizeBytes + 1,
    });

    expect(() => validateProfilePhotoFile(file)).toThrow(
      "Image must be 5 MB or smaller.",
    );
  });
});

describe("profile photo crop constants", () => {
  it("uses a 3:4 portrait aspect ratio", () => {
    expect(PROFILE_PHOTO_CROP.aspect).toBeCloseTo(0.75);
    expect(
      PROFILE_PHOTO_CROP.outputWidth / PROFILE_PHOTO_CROP.outputHeight,
    ).toBeCloseTo(0.75);
  });
});

describe("croppedBlobToFile", () => {
  it("creates a JPEG file from a cropped blob", () => {
    const blob = new Blob(["jpeg"], { type: "image/jpeg" });
    const file = croppedBlobToFile(blob, "founder.png");

    expect(file.type).toBe("image/jpeg");
    expect(file.name).toBe("founder-cropped.jpg");
  });
});

describe("revokeObjectUrl", () => {
  it("ignores non-blob URLs", () => {
    expect(() => revokeObjectUrl("https://example.com/photo.jpg")).not.toThrow();
  });
});
