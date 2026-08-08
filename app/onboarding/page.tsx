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

  if (onboarding?.onboardingCompleted) {
    redirect(ROUTES.app.home);
  }

  return (
    <OnboardingFlow
      userName={session.user.name}
      initialEmailVerified={Boolean(onboarding?.emailVerified)}
    />
  );
}
