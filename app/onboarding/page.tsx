import { redirect } from "next/navigation";

import { auth } from "@/auth";
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

  // Stale JWT after DB purge / deleted account — clear via /logout to avoid
  // middleware bouncing /register → /home while the session cookie still exists.
  if (!onboarding) {
    const to = `${ROUTES.login}?error=stale_session`;
    redirect(`${ROUTES.logout}?to=${encodeURIComponent(to)}`);
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
