import type { Provider } from "next-auth/providers";

import { credentialsProvider } from "@/lib/auth/providers/credentials";

/**
 * Auth.js providers.
 * Add Google, LinkedIn, or Email OTP providers here without changing auth.ts.
 */
export const authProviders: Provider[] = [
  credentialsProvider,
  // Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET }),
  // LinkedIn({ clientId: process.env.AUTH_LINKEDIN_ID, clientSecret: process.env.AUTH_LINKEDIN_SECRET }),
];
