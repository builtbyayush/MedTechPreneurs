import { ImageResponse } from "next/og";

import { BRAND } from "@/constants/brand";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND.colors.deepBlue,
          color: "#ffffff",
          fontSize: 56,
          fontWeight: 700,
          letterSpacing: "-0.04em",
        }}
      >
        <span>Splice</span>
        <span style={{ color: BRAND.colors.coral, fontSize: 36 }}>+</span>
      </div>
    ),
    {
      width: 192,
      height: 192,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
  );
}
