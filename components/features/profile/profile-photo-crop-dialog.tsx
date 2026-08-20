"use client";

import { Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";

import { Button } from "@/components/ui/button";
import { PROFILE_PHOTO_CROP } from "@/constants/cloudinary";
import { renderCroppedProfilePhoto } from "@/lib/client/crop-profile-photo";
import { cn } from "@/lib/utils";

type ProfilePhotoCropDialogProps = {
  open: boolean;
  imageSrc: string;
  isProcessing?: boolean;
  onCancel: () => void;
  onApply: (croppedPreviewUrl: string, croppedFile: File) => void;
  onError: (message: string) => void;
};

async function cropToPreviewFile(
  imageSrc: string,
  croppedAreaPixels: Area,
): Promise<{ previewUrl: string; file: File }> {
  const blob = await renderCroppedProfilePhoto(imageSrc, croppedAreaPixels);
  const file = new File([blob], "profile-photo-cropped.jpg", {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
  const previewUrl = URL.createObjectURL(blob);
  return { previewUrl, file };
}

export function ProfilePhotoCropDialog({
  open,
  imageSrc,
  isProcessing = false,
  onCancel,
  onApply,
  onError,
}: ProfilePhotoCropDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(PROFILE_PHOTO_CROP.defaultZoom);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function handleApply() {
    if (!croppedAreaPixels || isApplying || isProcessing) {
      return;
    }

    setIsApplying(true);

    try {
      const { previewUrl, file } = await cropToPreviewFile(
        imageSrc,
        croppedAreaPixels,
      );
      onApply(previewUrl, file);
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Unable to crop this image. Please try again.",
      );
    } finally {
      setIsApplying(false);
    }
  }

  if (!open) {
    return null;
  }

  const busy = isApplying || isProcessing;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-photo-crop-title"
    >
      <div className="border-b border-border px-4 py-4 sm:px-6">
        <h2
          id="profile-photo-crop-title"
          className="font-heading text-lg font-bold text-foreground"
        >
          Edit profile photo
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag to reposition and use the slider to zoom. Your photo is saved
          only after you confirm the preview.
        </p>
      </div>

      <div className="relative min-h-0 flex-1 bg-black/90">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={PROFILE_PHOTO_CROP.aspect}
          minZoom={PROFILE_PHOTO_CROP.minZoom}
          maxZoom={PROFILE_PHOTO_CROP.maxZoom}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          objectFit="contain"
          showGrid={false}
        />
      </div>

      <div className="space-y-4 border-t border-border bg-card px-4 py-4 sm:px-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="profile-photo-zoom"
              className="text-sm font-medium text-foreground"
            >
              Zoom
            </label>
            <span className="text-xs tabular-nums text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ZoomOut
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <input
              id="profile-photo-zoom"
              type="range"
              min={PROFILE_PHOTO_CROP.minZoom}
              max={PROFILE_PHOTO_CROP.maxZoom}
              step={0.05}
              value={zoom}
              disabled={busy}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="h-2 w-full cursor-pointer accent-teal"
              aria-valuemin={PROFILE_PHOTO_CROP.minZoom}
              aria-valuemax={PROFILE_PHOTO_CROP.maxZoom}
              aria-valuenow={zoom}
            />
            <ZoomIn
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-border bg-muted text-foreground"
            disabled={busy}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className={cn(
              "flex-1 bg-teal font-bold text-ink hover:bg-teal/80",
              busy && "opacity-80",
            )}
            disabled={busy || !croppedAreaPixels}
            aria-busy={busy}
            onClick={() => void handleApply()}
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Processing…
              </>
            ) : (
              "Apply"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
