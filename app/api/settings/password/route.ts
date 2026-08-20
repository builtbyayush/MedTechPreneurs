import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  AccountAccessError,
  assertActiveAccount,
} from "@/lib/auth/account";
import { ChangePasswordError, changePasswordForUser } from "@/lib/settings/change-password";
import { changePasswordSchema } from "@/lib/validations/change-password";

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await assertActiveAccount(session.user.id);

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: parsed.error.issues[0]?.message ?? "Invalid password data",
        },
        { status: 400 },
      );
    }

    await changePasswordForUser(session.user.id, {
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    });

    return NextResponse.json({
      ok: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("[settings/password/PATCH]", error);

    if (error instanceof AccountAccessError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    if (error instanceof ChangePasswordError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Unable to change password. Please try again." },
      { status: 500 },
    );
  }
}
