import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import {
  mapFounderRoleToCategory,
  mapLookingForRolesToCategories,
} from "@/lib/onboarding/mappers";
import { completeOnboardingSchema } from "@/lib/validations/onboarding";
import { User } from "@/models/User";

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = completeOnboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: parsed.error.issues[0]?.message ?? "Invalid onboarding data",
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const country = data.country?.trim() || undefined;
    const city = data.city?.trim() || undefined;
    const uniqueLookingForRoles = [...new Set(data.lookingForRoles)];
    const legacyCategory = mapFounderRoleToCategory(data.founderRole);
    const mappedLookingFor = mapLookingForRolesToCategories(uniqueLookingForRoles);
    const legacyLookingFor = mappedLookingFor.filter(
      (category) => category !== legacyCategory,
    );

    await connectDB();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        founderRole: data.founderRole,
        buildingFocus: data.buildingFocus,
        currentStage: data.currentStage,
        lookingForRoles: uniqueLookingForRoles,
        country,
        city,
        category: legacyCategory,
        lookingFor:
          legacyLookingFor.length > 0 ? legacyLookingFor : mappedLookingFor,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      },
      { returnDocument: "after" },
    ).select("onboardingCompleted founderRole buildingFocus");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user._id.toString(),
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error("[onboarding/PATCH]", error);
    return NextResponse.json(
      { error: "Unable to save onboarding" },
      { status: 500 },
    );
  }
}
