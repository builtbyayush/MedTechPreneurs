import { isPwaEnabled } from "@/config/env";

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "Splice+",
  description:
    "Find the co-founder your MedTech idea is missing. Ranked by complementarity for clinicians, engineers, and founders in Indian healthcare.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  themeColor: "#0f2a47",
  backgroundColor: "#f7fafa",
  pwa: {
    enabled: isPwaEnabled(),
    display: "standalone" as const,
    orientation: "portrait" as const,
  },
} as const;
