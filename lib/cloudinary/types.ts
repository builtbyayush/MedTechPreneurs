export type CloudinarySignedUploadParams = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  overwrite: boolean;
  type?: "upload" | "authenticated";
  resourceType?: "image" | "raw" | "auto";
};

export type CloudinaryUploadSignRequest = {
  folder: string;
  publicId?: string;
  overwrite?: boolean;
  type?: "upload" | "authenticated";
  resourceType?: "image" | "raw" | "auto";
};

export type CloudinaryUploadSignOptions = CloudinaryUploadSignRequest & {
  userId?: string;
};
