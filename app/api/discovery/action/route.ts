import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  AccountAccessError,
  assertActiveAccount,
} from "@/lib/auth/account";
import { BlockError } from "@/lib/blocks/queries";
import { recordDiscoveryAction } from "@/lib/discovery/queries";
import { discoveryActionSchema } from "@/lib/validations/discovery";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await assertActiveAccount(session.user.id);

    const body = await request.json();
    const parsed = discoveryActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: parsed.error.issues[0]?.message ?? "Invalid action",
        },
        { status: 400 },
      );
    }

    const result = await recordDiscoveryAction({
      viewerId: session.user.id,
      targetUserId: parsed.data.targetUserId,
      action: parsed.data.action,
    });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error("[discovery/action/POST]", error);

    if (error instanceof AccountAccessError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    if (error instanceof BlockError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    const message =
      error instanceof Error ? error.message : "Unable to save discovery action";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
