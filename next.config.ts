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
  /** Fallback: expose server Pusher app key/cluster to the browser when NEXT_PUBLIC_* are unset. */
  env: {
    NEXT_PUBLIC_PUSHER_KEY:
      process.env.NEXT_PUBLIC_PUSHER_KEY ?? process.env.PUSHER_KEY ?? "",
    NEXT_PUBLIC_PUSHER_CLUSTER:
      process.env.NEXT_PUBLIC_PUSHER_CLUSTER ??
      process.env.PUSHER_CLUSTER ??
      "",
    NEXT_PUBLIC_REALTIME_DEBUG: process.env.REALTIME_DEBUG ?? "false",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  /** Required for mobile/LAN testing in `next dev` (Next.js 16+ blocks cross-origin dev assets). */
  allowedDevOrigins: getAllowedDevOrigins(),
  async headers() {
    return [
      {
        source: "/manifest.webmanifest",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
        ],
      },
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
      {
        /**
         * Prevent proxies/browsers from caching HTML with stale `/_next/static`
         * chunk hashes after redeploys (causes turbopack-*.js 404 loops).
         */
        source:
          "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:js|css|png|jpg|jpeg|gif|webp|svg|ico|woff2?)$).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
