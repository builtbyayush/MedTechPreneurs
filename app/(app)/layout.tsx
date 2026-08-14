import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { auth } from "@/auth";
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

/**
 * Clear the session via /logout, then land on a public page.
 *
 * NEVER send a still-authenticated browser to /login or /register directly —
 * middleware redirects logged-in users from those routes back to /home and
 * creates an infinite reload loop (see Network: register 307 → home canceled).
 */
function recoverSession(reason: string): never {
  const to = `${ROUTES.login}?error=${encodeURIComponent(reason)}`;
  redirect(`${ROUTES.logout}?to=${encodeURIComponent(to)}`);
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

async function AppLayoutContent({ children }: AppLayoutProps) {
  const session = await auth();

  if (!session?.user?.id) {
    // Unauthenticated on an app route — go to login (middleware usually
    // handles this first; this is a safe fallback).
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
    recoverSession("session_recovery");
  }

  // Stale JWT / deleted account — must clear cookie via /logout (not /register).
  if (!access) {
    recoverSession("stale_session");
  }

  if (!access.allowed) {
    recoverSession("account_restricted");
  }

  if (!onboarding) {
    recoverSession("stale_session");
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
