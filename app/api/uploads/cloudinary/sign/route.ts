import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { CLOUDINARY_FOLDERS } from "@/constants/cloudinary";
import {
  createSignedUploadParams,
  isCloudinaryConfigured,
} from "@/lib/cloudinary/server";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: "Uploads are not configured" },
        { status: 503 },
      );
    }

    const signed = createSignedUploadParams({
      folder: CLOUDINARY_FOLDERS.profileImages,
      userId: session.user.id,
      overwrite: true,
    });

    return NextResponse.json({ ok: true, upload: signed });
  } catch (error) {
    console.error("[uploads/cloudinary/sign/POST]", error);
    return NextResponse.json(
      { error: "Unable to prepare upload" },
      { status: 500 },
    );
  }
}
