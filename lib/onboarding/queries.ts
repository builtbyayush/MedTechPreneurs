import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export type UserOnboardingRecord = {
  onboardingCompleted: boolean;
  founderRole?: string | null;
  buildingFocus?: string | null;
  currentStage?: string | null;
  lookingForRoles?: string[];
  country?: string | null;
  city?: string | null;
};

export async function getUserOnboardingStatus(
  userId: string,
): Promise<UserOnboardingRecord | null> {
  await connectDB();

  const user = await User.findById(userId)
    .select(
      "onboardingCompleted founderRole buildingFocus currentStage lookingForRoles country city",
    )
    .lean<UserOnboardingRecord | null>();

  return user;
}
