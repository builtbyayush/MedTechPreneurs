import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { isAllowedProfilePhotoUrl } from "@/lib/cloudinary/server";
import { updateProfilePhotoUrl } from "@/lib/profile/queries";

const savePhotoSchema = z.object({
  secureUrl: z.string().trim().url("Invalid image URL"),
});

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = savePhotoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: parsed.error.issues[0]?.message ?? "Invalid photo URL",
        },
        { status: 400 },
      );
    }

    const { secureUrl } = parsed.data;

    if (!isAllowedProfilePhotoUrl(secureUrl)) {
      return NextResponse.json(
        { error: "Invalid photo URL", message: "Upload must come from Splice storage." },
        { status: 400 },
      );
    }

    const profile = await updateProfilePhotoUrl(session.user.id, secureUrl);

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    console.error("[profile/photo/PATCH]", error);
    return NextResponse.json(
      { error: "Unable to save profile photo" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await updateProfilePhotoUrl(session.user.id, undefined);

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    console.error("[profile/photo/DELETE]", error);
    return NextResponse.json(
      { error: "Unable to remove profile photo" },
      { status: 500 },
    );
  }
}
