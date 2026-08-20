import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { getDiscoveryFeed } from "@/lib/discovery/queries";
import { parseDiscoveryFiltersQuery } from "@/lib/validations/discovery";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let filters;

    try {
      const parsed = parseDiscoveryFiltersQuery(searchParams);
      filters = {
        ...(parsed.q ? { query: parsed.q } : {}),
        ...(parsed.profession ? { professions: parsed.profession } : {}),
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            message: error.issues[0]?.message ?? "Invalid discovery filters",
          },
          { status: 400 },
        );
      }

      throw error;
    }

    const feed = await getDiscoveryFeed({
      viewerId: session.user.id,
      filters,
    });

    return NextResponse.json(feed);
  } catch (error) {
    console.error("[discovery/GET]", error);
    return NextResponse.json(
      { error: "Unable to load discovery feed" },
      { status: 500 },
    );
  }
}
