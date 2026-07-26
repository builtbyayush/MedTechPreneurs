import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getDiscoveryFeed } from "@/lib/discovery/queries";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const feed = await getDiscoveryFeed({ viewerId: session.user.id });

    return NextResponse.json(feed);
  } catch (error) {
    console.error("[discovery/GET]", error);
    return NextResponse.json(
      { error: "Unable to load discovery feed" },
      { status: 500 },
    );
  }
}
