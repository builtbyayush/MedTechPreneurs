import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  getFounderProfile,
  updateFounderProfile,
} from "@/lib/profile/queries";
import { profileUpdateSchema } from "@/lib/validations/profile";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getFounderProfile(session.user.id);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[profile/GET]", error);
    return NextResponse.json(
      { error: "Unable to load profile" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: parsed.error.issues[0]?.message ?? "Invalid profile data",
        },
        { status: 400 },
      );
    }

    const profile = await updateFounderProfile(session.user.id, parsed.data);

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    console.error("[profile/PATCH]", error);
    return NextResponse.json(
      { error: "Unable to save profile" },
      { status: 500 },
    );
  }
}
