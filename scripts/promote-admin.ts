import { hash } from "bcryptjs";

import { connectDB, disconnectDB } from "../lib/db";
import {
  mapFounderRoleToCategory,
  mapLookingForRolesToCategories,
} from "../lib/onboarding/mappers";
import { User } from "../models/User";

const EMAIL = "noor@gmail.com";
const PASSWORD = "Password@123";
const NAME = "Noor Admin";

async function main() {
  await connectDB();

  const passwordHash = await hash(PASSWORD, 12);
  const now = new Date();

  const user = await User.findOneAndUpdate(
    { email: EMAIL },
    {
      $set: {
        name: NAME,
        email: EMAIL,
        passwordHash,
        authProvider: "credentials",
        termsAcceptedAt: now,
        onboardingCompleted: true,
        onboardingCompletedAt: now,
        role: "admin",
        accountStatus: "active",
        suspendedUntil: null,
        isActive: true,
        emailVerified: true,
        founderRole: "business",
        buildingFocus: "healthcare-saas",
        currentStage: "mvp",
        lookingForRoles: ["engineer", "doctor"],
        partnershipGoals: ["finding-partnership"],
        country: "India",
        city: "Bengaluru",
        headline: "Splice moderation admin",
        bio: "Admin account for reviewing user reports and trust & safety actions.",
        skills: ["Operations", "Trust & safety"],
        yearsExperience: 5,
        companyName: "Splice",
        category: mapFounderRoleToCategory("business"),
        lookingFor: mapLookingForRolesToCategories(["engineer", "doctor"]),
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  ).select("email name role accountStatus onboardingCompleted");

  console.log("Admin account ready:");
  console.log({
    email: user.email,
    name: user.name,
    role: user.role,
    accountStatus: user.accountStatus,
    onboardingCompleted: user.onboardingCompleted,
  });
  console.log(`\nLogin at http://localhost:3000/login`);
  console.log(`Email:    ${EMAIL}`);
  console.log(`Password: ${PASSWORD}`);

  await disconnectDB();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await disconnectDB();
  } catch {
    // ignore
  }
  process.exit(1);
});
