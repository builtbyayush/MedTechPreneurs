export type StorageProvider = "local" | "cloudinary" | "s3";

export type UploadResult = {
  url: string;
  key?: string;
  provider: StorageProvider;
};

export type UploadProfilePhotoInput = {
  file: File;
  userId: string;
};

export class UploadNotConfiguredError extends Error {
  constructor(message = "Cloud storage is not configured yet.") {
    super(message);
    this.name = "UploadNotConfiguredError";
  }
}
