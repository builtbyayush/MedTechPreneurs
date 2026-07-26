import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ProfileEditor } from "@/components/features/profile/profile-editor";
import { ROUTES } from "@/constants/routes";
import { getFounderProfile } from "@/lib/profile/queries";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  const profile = await getFounderProfile(session.user.id);

  if (!profile) {
    redirect(ROUTES.onboarding);
  }

  return <ProfileEditor initialProfile={profile} />;
}
