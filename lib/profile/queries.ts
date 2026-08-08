import { connectDB } from "@/lib/db";
import {
  mapFounderRoleToCategory,
  mapLookingForRolesToCategories,
} from "@/lib/onboarding/mappers";
import {
  normalizeProfileInput,
  type ProfileUpdateInput,
} from "@/lib/validations/profile";
import { User } from "@/models/User";
import type { FounderProfile } from "@/types/profile";

function serializeFounderProfile(user: {
  _id: { toString(): string };
  name: string;
  email: string;
  profilePhotoUrl?: string | null;
  headline?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  yearsExperience?: number | null;
  companyName?: string | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
  founderRole?: FounderProfile["founderRole"] | null;
  buildingFocus?: FounderProfile["buildingFocus"] | null;
  currentStage?: FounderProfile["currentStage"] | null;
  lookingForRoles?: FounderProfile["lookingForRoles"] | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
}): FounderProfile {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    profilePhotoUrl: user.profilePhotoUrl ?? undefined,
    headline: user.headline ?? undefined,
    bio: user.bio ?? undefined,
    skills: user.skills ?? [],
    yearsExperience: user.yearsExperience ?? undefined,
    companyName: user.companyName ?? undefined,
    linkedinUrl: user.linkedinUrl ?? undefined,
    websiteUrl: user.websiteUrl ?? undefined,
    founderRole: user.founderRole ?? undefined,
    buildingFocus: user.buildingFocus ?? undefined,
    currentStage: user.currentStage ?? undefined,
    lookingForRoles: user.lookingForRoles ?? [],
    country: user.country ?? undefined,
    state: user.state ?? undefined,
    city: user.city ?? undefined,
  };
}

export async function getFounderProfile(
  userId: string,
): Promise<FounderProfile | null> {
  await connectDB();

  const user = await User.findById(userId)
    .select(
      "name email profilePhotoUrl headline bio skills yearsExperience companyName linkedinUrl websiteUrl founderRole buildingFocus currentStage lookingForRoles country state city",
    )
    .lean();

  if (!user) {
    return null;
  }

  return serializeFounderProfile(user);
}

export async function updateFounderProfile(
  userId: string,
  input: ProfileUpdateInput,
): Promise<FounderProfile> {
  await connectDB();

  const data = normalizeProfileInput(input);

  const updatePayload: Record<string, unknown> = {
    profilePhotoUrl: data.profilePhotoUrl,
    headline: data.headline,
    bio: data.bio,
    skills: data.skills,
    yearsExperience: data.yearsExperience,
    companyName: data.companyName,
    linkedinUrl: data.linkedinUrl,
    websiteUrl: data.websiteUrl,
  };

  if (data.founderRole) {
    updatePayload.founderRole = data.founderRole;
    updatePayload.category = mapFounderRoleToCategory(data.founderRole);
  }

  if (data.buildingFocus) {
    updatePayload.buildingFocus = data.buildingFocus;
  }

  if (data.currentStage) {
    updatePayload.currentStage = data.currentStage;
  }

  if (data.lookingForRoles && data.lookingForRoles.length > 0) {
    updatePayload.lookingForRoles = data.lookingForRoles;
    updatePayload.lookingFor = mapLookingForRolesToCategories(
      data.lookingForRoles,
    );
  }

  if (data.country !== undefined) {
    updatePayload.country = data.country;
  }

  if (data.state !== undefined) {
    updatePayload.state = data.state;
  }

  if (data.city !== undefined) {
    updatePayload.city = data.city;
  }

  const user = await User.findByIdAndUpdate(userId, updatePayload, {
    returnDocument: "after",
  })
    .select(
      "name email profilePhotoUrl headline bio skills yearsExperience companyName linkedinUrl websiteUrl founderRole buildingFocus currentStage lookingForRoles country state city",
    )
    .lean();

  if (!user) {
    throw new Error("User not found");
  }

  return serializeFounderProfile(user);
}

export async function getUserProfilePhotoUrl(
  userId: string,
): Promise<string | undefined> {
  await connectDB();

  const user = await User.findById(userId).select("profilePhotoUrl").lean();

  return user?.profilePhotoUrl?.trim() || undefined;
}

export async function updateProfilePhotoUrl(
  userId: string,
  profilePhotoUrl: string | undefined,
): Promise<FounderProfile> {
  await connectDB();

  const user = await User.findByIdAndUpdate(
    userId,
    {
      profilePhotoUrl: profilePhotoUrl?.trim() || undefined,
    },
    { returnDocument: "after" },
  )
    .select(
      "name email profilePhotoUrl headline bio skills yearsExperience companyName linkedinUrl websiteUrl founderRole buildingFocus currentStage lookingForRoles country state city",
    )
    .lean();

  if (!user) {
    throw new Error("User not found");
  }

  return serializeFounderProfile(user);
}
