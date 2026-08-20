import { redirect } from "next/navigation";

import { SettingsPage } from "@/components/features/settings/settings-page";
import { auth } from "@/auth";
import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/lib/auth/account";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export const metadata = {
  title: "Settings",
};

export default async function AppSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  let isAdmin = false;
  try {
    await requireAdmin(session.user.id);
    isAdmin = true;
  } catch {
    isAdmin = false;
  }

  await connectDB();
  const userRecord = await User.findById(session.user.id)
    .select("emailVerified")
    .lean<{ emailVerified?: boolean } | null>();

  return (
    <SettingsPage
      user={{
        name: session.user.name,
        email: session.user.email,
      }}
      emailVerified={Boolean(userRecord?.emailVerified)}
      isAdmin={isAdmin}
    />
  );
}
