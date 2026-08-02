"use client";

import { Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  compressProfilePhoto,
  ProfilePhotoValidationError,
} from "@/lib/client/compress-profile-photo";
import {
  ProfilePhotoUploadError,
  removeProfilePhoto,
  saveProfilePhotoSecureUrl,
  uploadProfilePhotoToCloudinary,
} from "@/lib/client/upload-profile-photo";
import { cn } from "@/lib/utils";

type ProfilePhotoUploadProps = {
  hasPhoto: boolean;
  disabled?: boolean;
  onPhotoChange: (secureUrl: string | undefined) => void;
  className?: string;
};

export function ProfilePhotoUpload({
  hasPhoto,
  disabled = false,
  onPhotoChange,
  className,
}: ProfilePhotoUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || disabled || isUploading || isRemoving) {
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const compressed = await compressProfilePhoto(file);
      const secureUrl = await uploadProfilePhotoToCloudinary(compressed);
      const savedUrl = await saveProfilePhotoSecureUrl(secureUrl);
      onPhotoChange(savedUrl);
      router.refresh();
    } catch (uploadError) {
      const message =
        uploadError instanceof ProfilePhotoValidationError ||
        uploadError instanceof ProfilePhotoUploadError
          ? uploadError.message
          : "Photo upload failed. Please try again.";

      setError(message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemove() {
    if (disabled || isUploading || isRemoving || !hasPhoto) {
      return;
    }

    setError(null);
    setIsRemoving(true);

    try {
      await removeProfilePhoto();
      onPhotoChange(undefined);
      router.refresh();
    } catch (removeError) {
      const message =
        removeError instanceof ProfilePhotoUploadError
          ? removeError.message
          : "Unable to remove photo. Please try again.";

      setError(message);
    } finally {
      setIsRemoving(false);
    }
  }

  const isBusy = isUploading || isRemoving;

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="sr-only"
        disabled={disabled || isBusy}
        onChange={(event) => void handleFileChange(event)}
        aria-label="Upload profile photo"
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="border-white/15 bg-white/[0.03] text-white hover:bg-white/[0.06]"
          disabled={disabled || isBusy}
          aria-busy={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="size-4" aria-hidden />
              {hasPhoto ? "Replace photo" : "Upload photo"}
            </>
          )}
        </Button>

        {hasPhoto ? (
          <Button
            type="button"
            variant="ghost"
            className="text-white/65 hover:bg-white/5 hover:text-white"
            disabled={disabled || isBusy}
            aria-busy={isRemoving}
            onClick={() => void handleRemove()}
          >
            {isRemoving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Removing…
              </>
            ) : (
              <>
                <X className="size-4" aria-hidden />
                Remove photo
              </>
            )}
          </Button>
        ) : null}
      </div>

      <p className="text-xs text-white/45">
        JPEG, PNG, or WebP up to 5 MB. Images are resized to 800×800 and
        compressed before upload.
      </p>

      {error ? (
        <p className="text-sm text-coral" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
