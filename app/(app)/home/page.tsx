import { redirect } from "next/navigation";

import { HomeDashboard } from "@/components/features/home/home-dashboard";
import { auth } from "@/auth";
import { ROUTES } from "@/constants/routes";
import { getHomeDashboard } from "@/lib/home/queries";

export const metadata = {
  title: "Home",
};

export default async function AppHomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  try {
    const data = await getHomeDashboard(session.user.id);
    return <HomeDashboard data={data} />;
  } catch (error) {
    console.error("[home] getHomeDashboard failed", error);
    throw error;
  }
}
