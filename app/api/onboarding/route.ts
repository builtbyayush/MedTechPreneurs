import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { onboardingSchema } from "@/lib/validations/onboarding";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Enforce lookingFor excludes own category at the API layer
    if (data.lookingFor.includes(data.category)) {
      return NextResponse.json(
        {
          error: "lookingFor cannot include your own category",
        },
        { status: 400 }
      );
    }

    const uniqueLookingFor = [...new Set(data.lookingFor)];

    await connectDB();

    const existing = await User.findOne({
      email: data.email.toLowerCase(),
    }).lean();

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hash(data.password, 12);

    const user = await User.create({
      name: data.name.trim(),
      gender: data.gender,
      email: data.email.toLowerCase(),
      mobile: data.mobile.trim(),
      age: data.age,
      profession: data.profession.trim(),
      specialisation: data.specialisation.trim(),
      category: data.category,
      lookingFor: uniqueLookingFor,
      passwordHash,
      authProvider: "credentials",
    });

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[onboarding]", error);
    return NextResponse.json(
      { error: "Unable to complete onboarding" },
      { status: 500 }
    );
  }
}
