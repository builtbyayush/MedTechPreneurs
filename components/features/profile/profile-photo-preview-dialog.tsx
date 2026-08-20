"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProfilePhotoPreviewDialogProps = {
  open: boolean;
  previewUrl: string;
  isSaving?: boolean;
  onCancel: () => void;
  onBack: () => void;
  onSave: () => void;
};

export function ProfilePhotoPreviewDialog({
  open,
  previewUrl,
  isSaving = false,
  onCancel,
  onBack,
  onSave,
}: ProfilePhotoPreviewDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-photo-preview-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-founder-card">
        <h2
          id="profile-photo-preview-title"
          className="font-heading text-lg font-bold text-foreground"
        >
          Preview profile photo
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This is how your photo will appear on your profile and founder cards.
          Your current photo stays active until you save.
        </p>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border">
          <div className="relative aspect-[3/4] w-full bg-muted">
            <Image
              src={previewUrl}
              alt="Cropped profile photo preview"
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 448px) 100vw, 448px"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-border bg-muted text-foreground"
            disabled={isSaving}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-border bg-muted text-foreground"
            disabled={isSaving}
            onClick={onBack}
          >
            Back to edit
          </Button>
          <Button
            type="button"
            className={cn(
              "flex-1 bg-teal font-bold text-ink hover:bg-teal/80",
              isSaving && "opacity-80",
            )}
            disabled={isSaving}
            aria-busy={isSaving}
            onClick={onSave}
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              "Save photo"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
