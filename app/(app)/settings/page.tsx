import { redirect } from "next/navigation";

import { SettingsPage } from "@/components/features/settings/settings-page";
import { auth } from "@/auth";
import { ROUTES } from "@/constants/routes";

export const metadata = {
  title: "Settings",
};

export default async function AppSettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(ROUTES.login);
  }

  return (
    <SettingsPage
      user={{
        name: session.user.name,
        email: session.user.email,
      }}
    />
  );
}
