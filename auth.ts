import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";
import { authProviders } from "@/lib/auth/providers";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: authProviders,
});
