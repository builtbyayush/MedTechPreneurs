import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

import {
  BUILDING_TYPES,
  CURRENT_STAGES,
  FOUNDER_ROLES,
  LOOKING_FOR_ROLES,
  PARTNERSHIP_GOALS,
} from "@/types/onboarding";
import { GENDERS, USER_CATEGORIES } from "@/types/user";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    authProvider: {
      type: String,
      enum: ["credentials", "google", "linkedin", "email-otp"],
      default: "credentials",
    },
    termsAcceptedAt: { type: Date },
    onboardingCompleted: { type: Boolean, default: false },
    onboardingCompletedAt: { type: Date },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    founderRole: { type: String, enum: FOUNDER_ROLES },
    buildingFocus: { type: String, enum: BUILDING_TYPES },
    currentStage: { type: String, enum: CURRENT_STAGES },
    lookingForRoles: {
      type: [{ type: String, enum: LOOKING_FOR_ROLES }],
      default: [],
    },
    partnershipGoals: {
      type: [{ type: String, enum: PARTNERSHIP_GOALS }],
      default: [],
    },
    country: { type: String, trim: true },
    city: { type: String, trim: true },
    profilePhotoUrl: { type: String, trim: true },
    headline: { type: String, trim: true, maxlength: 120 },
    bio: { type: String, trim: true, maxlength: 280 },
    skills: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    yearsExperience: { type: Number, min: 0, max: 60 },
    companyName: { type: String, trim: true, maxlength: 80 },
    linkedinUrl: { type: String, trim: true },
    websiteUrl: { type: String, trim: true },
    gender: { type: String, enum: GENDERS },
    mobile: { type: String, trim: true },
    age: { type: Number, min: 18, max: 100 },
    profession: { type: String, trim: true },
    specialisation: { type: String, trim: true },
    /** Legacy discovery categories — synced from onboarding roles */
    category: { type: String, enum: USER_CATEGORIES },
    lookingFor: {
      type: [{ type: String, enum: USER_CATEGORIES }],
      default: [],
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const User: Model<UserDocument> =
  mongoose.models.User ?? mongoose.model<UserDocument>("User", UserSchema);
