import { ImageResponse } from "next/og";

import { BRAND } from "@/constants/brand";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
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
          fontSize: 52,
          fontWeight: 700,
          letterSpacing: "-0.04em",
        }}
      >
        <span>Splice</span>
        <span style={{ color: BRAND.colors.coral, fontSize: 34 }}>+</span>
      </div>
    ),
    size,
  );
}
