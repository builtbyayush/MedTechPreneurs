import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { OnboardingFlow } from "@/components/features/onboarding/onboarding-flow";
import { ROUTES } from "@/constants/routes";
import { getUserOnboardingStatus } from "@/lib/onboarding/queries";

export const metadata = {
  title: "Onboarding",
};

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  const onboarding = await getUserOnboardingStatus(session.user.id);

  // Stale JWT after DB purge / deleted account — clear session and start fresh.
  if (!onboarding) {
    await signOut({ redirectTo: ROUTES.register });
    redirect(ROUTES.register);
  }

  if (onboarding.onboardingCompleted) {
    redirect(ROUTES.app.home);
  }

  return (
    <OnboardingFlow
      userName={session.user.name}
      initialEmailVerified={Boolean(onboarding.emailVerified)}
    />
  );
}
