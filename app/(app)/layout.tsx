import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { auth, signOut } from "@/auth";
import { AppShell } from "@/components/features/app/app-shell";
import { ROUTES } from "@/constants/routes";
import {
  loadAccountAccess,
  type AccountAccessState,
} from "@/lib/auth/account";
import { getUserOnboardingStatus } from "@/lib/onboarding/queries";
import { getUserProfilePhotoUrl } from "@/lib/profile/queries";

type AppLayoutProps = {
  children: ReactNode;
};

type OnboardingStatus = NonNullable<
  Awaited<ReturnType<typeof getUserOnboardingStatus>>
>;

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

/** signOut({ redirectTo }) throws a redirect — treat other failures as soft clears. */
async function signOutTo(redirectTo: string): Promise<never> {
  try {
    await signOut({ redirectTo });
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }
    console.error("[app-layout] signOut failed; forcing redirect", error);
  }
  redirect(redirectTo);
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  const userId = session.user.id;

  let access: AccountAccessState | null = null;
  try {
    access = await loadAccountAccess(userId);
  } catch (error) {
    console.error("[app-layout] loadAccountAccess failed", error);
    return signOutTo(`${ROUTES.login}?error=session_recovery`);
  }

  if (!access) {
    return signOutTo(ROUTES.register);
  }

  if (!access.allowed) {
    return signOutTo(`${ROUTES.login}?error=account_restricted`);
  }

  let onboarding: OnboardingStatus | null = null;
  try {
    onboarding = await getUserOnboardingStatus(userId);
  } catch (error) {
    console.error("[app-layout] getUserOnboardingStatus failed", error);
    return signOutTo(`${ROUTES.login}?error=session_recovery`);
  }

  // Stale JWT after DB purge / deleted account — clear session and start fresh.
  if (!onboarding) {
    return signOutTo(ROUTES.register);
  }

  if (!onboarding.onboardingCompleted) {
    redirect(ROUTES.onboarding);
  }

  let profilePhotoUrl: string | null = null;
  try {
    profilePhotoUrl = (await getUserProfilePhotoUrl(userId)) ?? null;
  } catch (error) {
    console.error("[app-layout] getUserProfilePhotoUrl failed", error);
  }

  return (
    <AppShell user={session.user} profilePhotoUrl={profilePhotoUrl}>
      {children}
    </AppShell>
  );
}
