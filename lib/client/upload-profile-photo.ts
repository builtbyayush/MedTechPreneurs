import type { CloudinarySignedUploadParams } from "@/lib/cloudinary/types";

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: { message?: string };
};

export class ProfilePhotoUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfilePhotoUploadError";
  }
}

async function fetchSignedUploadParams(): Promise<CloudinarySignedUploadParams> {
  const response = await fetch("/api/uploads/cloudinary/sign", {
    method: "POST",
  });

  const payload = (await response.json().catch(() => null)) as {
    upload?: CloudinarySignedUploadParams;
    error?: string;
  } | null;

  if (!response.ok || !payload?.upload) {
    throw new ProfilePhotoUploadError(
      payload?.error ?? "Unable to prepare photo upload.",
    );
  }

  return payload.upload;
}

export async function uploadProfilePhotoToCloudinary(
  file: File,
): Promise<string> {
  const signed = await fetchSignedUploadParams();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signed.apiKey);
  formData.append("timestamp", String(signed.timestamp));
  formData.append("signature", signed.signature);
  formData.append("folder", signed.folder);
  formData.append("public_id", signed.publicId);

  if (signed.overwrite) {
    formData.append("overwrite", "true");
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const payload = (await response.json().catch(() => null)) as
    | CloudinaryUploadResponse
    | null;

  if (!response.ok || !payload?.secure_url) {
    throw new ProfilePhotoUploadError(
      payload?.error?.message ?? "Photo upload failed. Please try again.",
    );
  }

  return payload.secure_url;
}

export async function saveProfilePhotoSecureUrl(
  secureUrl: string,
): Promise<string> {
  const response = await fetch("/api/profile/photo", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secureUrl }),
  });

  const payload = (await response.json().catch(() => null)) as {
    profile?: { profilePhotoUrl?: string };
    error?: string;
    message?: string;
  } | null;

  if (!response.ok) {
    throw new ProfilePhotoUploadError(
      payload?.message ?? payload?.error ?? "Unable to save profile photo.",
    );
  }

  return payload?.profile?.profilePhotoUrl ?? secureUrl;
}

export async function removeProfilePhoto(): Promise<void> {
  const response = await fetch("/api/profile/photo", {
    method: "DELETE",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
      message?: string;
    } | null;

    throw new ProfilePhotoUploadError(
      payload?.message ?? payload?.error ?? "Unable to remove profile photo.",
    );
  }
}
