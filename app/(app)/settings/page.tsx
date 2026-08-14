import { redirect } from "next/navigation";

import { SettingsPage } from "@/components/features/settings/settings-page";
import { auth } from "@/auth";
import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/lib/auth/account";

export const metadata = {
  title: "Settings",
};

export default async function AppSettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(ROUTES.login);
  }

  let isAdmin = false;
  try {
    await requireAdmin(session.user.id);
    isAdmin = true;
  } catch {
    isAdmin = false;
  }

  return (
    <SettingsPage
      user={{
        name: session.user.name,
        email: session.user.email,
      }}
      isAdmin={isAdmin}
    />
  );
}
