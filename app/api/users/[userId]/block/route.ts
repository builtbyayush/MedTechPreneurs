import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  AccountAccessError,
  assertActiveAccount,
} from "@/lib/auth/account";
import { BlockError, blockUser, unblockUser } from "@/lib/blocks/queries";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await assertActiveAccount(session.user.id);

    const { userId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const block = await blockUser(session.user.id, userId);

    return NextResponse.json({
      ok: true,
      block,
      message: "User blocked.",
    });
  } catch (error) {
    console.error("[users/block/POST]", error);

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

    return NextResponse.json(
      { error: "Unable to block user" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await assertActiveAccount(session.user.id);

    const { userId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Block not found." }, { status: 404 });
    }

    await unblockUser(session.user.id, userId);

    return NextResponse.json({
      ok: true,
      message: "User unblocked.",
    });
  } catch (error) {
    console.error("[users/block/DELETE]", error);

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

    return NextResponse.json(
      { error: "Unable to unblock user" },
      { status: 500 },
    );
  }
}
