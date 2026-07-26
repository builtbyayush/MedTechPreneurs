import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { auth } from "@/auth";
import { AppShell } from "@/components/features/app/app-shell";
import { ROUTES } from "@/constants/routes";
import { getUserOnboardingStatus } from "@/lib/onboarding/queries";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect(ROUTES.login);
  }

  const onboarding = await getUserOnboardingStatus(session.user.id);

  if (!onboarding?.onboardingCompleted) {
    redirect(ROUTES.onboarding);
  }

  return <AppShell user={session.user}>{children}</AppShell>;
}
