"use client";

import { Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ProfilePhotoCropDialog } from "@/components/features/profile/profile-photo-crop-dialog";
import { ProfilePhotoPreviewDialog } from "@/components/features/profile/profile-photo-preview-dialog";
import { Button } from "@/components/ui/button";
import {
  compressProfilePhoto,
  ProfilePhotoValidationError,
} from "@/lib/client/compress-profile-photo";
import {
  prepareProfilePhotoCropSource,
  revokeObjectUrl,
} from "@/lib/client/crop-profile-photo";
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

type EditorStep = "idle" | "crop" | "preview";

export function ProfilePhotoUpload({
  hasPhoto,
  disabled = false,
  onPhotoChange,
  className,
}: ProfilePhotoUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<EditorStep>("idle");
  const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isPreparingCrop, setIsPreparingCrop] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      revokeObjectUrl(cropSourceUrl);
      revokeObjectUrl(previewUrl);
    };
  }, [cropSourceUrl, previewUrl]);

  function resetEditor() {
    revokeObjectUrl(cropSourceUrl);
    revokeObjectUrl(previewUrl);
    setCropSourceUrl(null);
    setPreviewUrl(null);
    setPendingFile(null);
    setStep("idle");
    setIsPreparingCrop(false);
  }

  function handleCancelEditor() {
    resetEditor();
    setError(null);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || disabled || isBusy) {
      return;
    }

    setError(null);
    setIsPreparingCrop(true);

    try {
      resetEditor();
      const sourceUrl = await prepareProfilePhotoCropSource(file);
      setCropSourceUrl(sourceUrl);
      setStep("crop");
    } catch (uploadError) {
      const message =
        uploadError instanceof ProfilePhotoValidationError
          ? uploadError.message
          : uploadError instanceof Error
            ? uploadError.message
            : "Unable to open this image. Please try another file.";

      setError(message);
      resetEditor();
    } finally {
      setIsPreparingCrop(false);
    }
  }

  function handleCropApply(nextPreviewUrl: string, croppedFile: File) {
    revokeObjectUrl(previewUrl);
    setPreviewUrl(nextPreviewUrl);
    setPendingFile(croppedFile);
    setStep("preview");
  }

  function handleBackToCrop() {
    revokeObjectUrl(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
    setStep("crop");
  }

  async function handleSavePhoto() {
    if (!pendingFile || isUploading) {
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const compressed = await compressProfilePhoto(pendingFile);
      const secureUrl = await uploadProfilePhotoToCloudinary(compressed);
      const savedUrl = await saveProfilePhotoSecureUrl(secureUrl);
      onPhotoChange(savedUrl);
      resetEditor();
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
    if (disabled || isBusy || !hasPhoto) {
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

  const isBusy =
    isUploading || isRemoving || isPreparingCrop || step !== "idle";

  return (
    <>
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
            className="border-border bg-muted text-foreground hover:bg-muted"
            disabled={disabled || isBusy}
            aria-busy={isPreparingCrop || isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {isPreparingCrop ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Preparing…
              </>
            ) : isUploading ? (
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
              className="text-muted-foreground hover:bg-muted hover:text-foreground"
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

        <p className="text-xs text-muted-foreground">
          JPEG, PNG, or WebP up to 5 MB. You&apos;ll crop your photo before it
          is saved.
        </p>

        {error ? (
          <p className="text-sm text-coral" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      {cropSourceUrl ? (
        <ProfilePhotoCropDialog
          key={cropSourceUrl}
          open={step === "crop"}
          imageSrc={cropSourceUrl}
          isProcessing={isPreparingCrop}
          onCancel={handleCancelEditor}
          onApply={handleCropApply}
          onError={(message) => {
            setError(message);
            handleCancelEditor();
          }}
        />
      ) : null}

      {previewUrl && pendingFile ? (
        <ProfilePhotoPreviewDialog
          key={previewUrl}
          open={step === "preview"}
          previewUrl={previewUrl}
          isSaving={isUploading}
          onCancel={handleCancelEditor}
          onBack={handleBackToCrop}
          onSave={() => void handleSavePhoto()}
        />
      ) : null}
    </>
  );
}
