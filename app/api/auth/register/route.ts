import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { AUTH_ERROR_MESSAGES } from "@/lib/auth/errors";
import { connectDB } from "@/lib/db";
import { registerRequestSchema } from "@/lib/validations/auth";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: parsed.error.issues[0]?.message ?? "Invalid registration data",
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    await connectDB();

    const existing = await User.findOne({
      email: data.email.toLowerCase(),
    }).lean();

    if (existing) {
      return NextResponse.json(
        { error: AUTH_ERROR_MESSAGES.emailExists },
        { status: 409 },
      );
    }

    const passwordHash = await hash(data.password, 12);

    const user = await User.create({
      name: data.name.trim(),
      email: data.email.toLowerCase(),
      passwordHash,
      authProvider: "credentials",
      termsAcceptedAt: new Date(),
      onboardingCompleted: false,
      lookingFor: [],
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
      { status: 201 },
    );
  } catch (error) {
    console.error("[auth/register]", error);
    return NextResponse.json(
      { error: AUTH_ERROR_MESSAGES.registrationFailed },
      { status: 500 },
    );
  }
}
