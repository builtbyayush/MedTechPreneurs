import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { auth, signOut } from "@/auth";
import { AppShell } from "@/components/features/app/app-shell";
import { ROUTES } from "@/constants/routes";
import { getUserOnboardingStatus } from "@/lib/onboarding/queries";
import { getUserProfilePhotoUrl } from "@/lib/profile/queries";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect(ROUTES.login);
  }

  const onboarding = await getUserOnboardingStatus(session.user.id);

  // Stale JWT after DB purge / deleted account — clear session and start fresh.
  if (!onboarding) {
    await signOut({ redirectTo: ROUTES.register });
    redirect(ROUTES.register);
  }

  if (!onboarding.onboardingCompleted) {
    redirect(ROUTES.onboarding);
  }

  const profilePhotoUrl = await getUserProfilePhotoUrl(session.user.id);

  return (
    <AppShell user={session.user} profilePhotoUrl={profilePhotoUrl}>
      {children}
    </AppShell>
  );
}
