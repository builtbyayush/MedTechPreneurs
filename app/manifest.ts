import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * Web App Manifest — required for Chrome "Install app" / Add to Home Screen.
 *
 * Installability checklist:
 * - HTTPS in production (not IP/HTTP)
 * - Service worker at /sw.js (see components/providers/pwa-register.tsx)
 * - Icons at 192×192 and 512×512 (see app/icon-192, app/icon-512)
 * - NEXT_PUBLIC_APP_URL must match your production domain at build time
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    /** Stable app id — do not change after users install. */
    id: "/",
    name: siteConfig.name,
    /** Keep ≤12 chars for home-screen labels. */
    short_name: "Splice",
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: siteConfig.pwa.display,
    orientation: siteConfig.pwa.orientation,
    background_color: siteConfig.backgroundColor,
    theme_color: siteConfig.themeColor,
    lang: "en",
    dir: "ltr",
    categories: ["business", "social"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
