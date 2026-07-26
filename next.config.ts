import type { NextConfig } from "next";

function getAllowedDevOrigins(): string[] {
  const raw = process.env.DEV_ALLOWED_ORIGINS;
  if (!raw?.trim()) {
    return [];
  }

  return raw
    .split(",")
    .map((origin) => origin.trim().replace(/^https?:\/\//, "").split(":")[0])
    .filter(Boolean);
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  /** Required for mobile/LAN testing in `next dev` (Next.js 16+ blocks cross-origin dev assets). */
  allowedDevOrigins: getAllowedDevOrigins(),
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
