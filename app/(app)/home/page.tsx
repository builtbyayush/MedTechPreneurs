import { redirect } from "next/navigation";

import { HomeDashboard } from "@/components/features/home/home-dashboard";
import { auth } from "@/auth";
import { ROUTES } from "@/constants/routes";
import { getHomeDashboard } from "@/lib/home/queries";

export const metadata = {
  title: "Home",
};

const HOME_QUERY_BUDGET_MS = 15_000;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error("[home] getHomeDashboard timed out"));
        }, ms);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

export default async function AppHomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  let data;
  try {
    data = await withTimeout(
      getHomeDashboard(session.user.id),
      HOME_QUERY_BUDGET_MS,
    );
  } catch (error) {
    console.error("[home] getHomeDashboard failed", error);
    throw error;
  }

  return <HomeDashboard data={data} />;
}
