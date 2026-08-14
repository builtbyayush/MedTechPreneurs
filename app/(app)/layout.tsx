import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { auth, signOut } from "@/auth";
import { AppShell } from "@/components/features/app/app-shell";
import AppLoading from "@/app/(app)/loading";
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

const LAYOUT_DB_BUDGET_MS = 12_000;

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`[app-layout] timed out waiting for ${label}`));
        }, ms);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
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

async function AppLayoutContent({ children }: AppLayoutProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  const userId = session.user.id;

  let access: AccountAccessState | null = null;
  let onboarding: OnboardingStatus | null = null;
  let profilePhotoUrl: string | null = null;

  try {
    const [accessResult, onboardingResult, photoResult] = await withTimeout(
      Promise.all([
        loadAccountAccess(userId),
        getUserOnboardingStatus(userId),
        getUserProfilePhotoUrl(userId).catch((error) => {
          console.error("[app-layout] getUserProfilePhotoUrl failed", error);
          return null;
        }),
      ]),
      LAYOUT_DB_BUDGET_MS,
      "account + onboarding",
    );

    access = accessResult;
    onboarding = onboardingResult;
    profilePhotoUrl = photoResult ?? null;
  } catch (error) {
    console.error("[app-layout] bootstrap failed", error);
    return signOutTo(`${ROUTES.login}?error=session_recovery`);
  }

  if (!access) {
    return signOutTo(ROUTES.register);
  }

  if (!access.allowed) {
    return signOutTo(`${ROUTES.login}?error=account_restricted`);
  }

  if (!onboarding) {
    return signOutTo(ROUTES.register);
  }

  if (!onboarding.onboardingCompleted) {
    redirect(ROUTES.onboarding);
  }

  return (
    <AppShell user={session.user} profilePhotoUrl={profilePhotoUrl}>
      {children}
    </AppShell>
  );
}

/**
 * Suspense around the async shell so Mongo/auth work shows AppLoading
 * instead of a blank document (loading.tsx does not wrap layout.js).
 */
export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100svh] bg-background">
          <AppLoading />
        </div>
      }
    >
      <AppLayoutContent>{children}</AppLayoutContent>
    </Suspense>
  );
}
