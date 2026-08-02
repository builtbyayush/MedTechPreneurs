export type CloudinarySignedUploadParams = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  overwrite: boolean;
};

export type CloudinaryUploadSignRequest = {
  folder: string;
  publicId?: string;
  overwrite?: boolean;
};

export type CloudinaryUploadSignOptions = CloudinaryUploadSignRequest & {
  userId?: string;
};
