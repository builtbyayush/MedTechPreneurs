import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { searchDiscoveryFounders } from "@/lib/discovery/queries";
import { discoverySearchSchema } from "@/lib/validations/report";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = discoverySearchSchema.safeParse({
      q: searchParams.get("q") ?? "",
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: parsed.error.issues[0]?.message ?? "Invalid search query",
        },
        { status: 400 },
      );
    }

    const results = await searchDiscoveryFounders({
      viewerId: session.user.id,
      query: parsed.data.q,
    });

    return NextResponse.json({
      query: parsed.data.q,
      results,
    });
  } catch (error) {
    console.error("[discovery/search/GET]", error);
    return NextResponse.json(
      { error: "Unable to search founders" },
      { status: 500 },
    );
  }
}
