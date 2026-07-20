import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

import { GENDERS, USER_CATEGORIES } from "@/types/user";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    gender: { type: String, enum: GENDERS, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 18, max: 100 },
    profession: { type: String, required: true, trim: true },
    specialisation: { type: String, required: true, trim: true },
    category: { type: String, enum: USER_CATEGORIES, required: true },
    lookingFor: {
      type: [{ type: String, enum: USER_CATEGORIES }],
      required: true,
      validate: {
        validator: (value: string[]) => Array.isArray(value) && value.length > 0,
        message: "lookingFor must include at least one category",
      },
    },
    passwordHash: { type: String, required: true, select: false },
    authProvider: {
      type: String,
      enum: ["credentials"],
      default: "credentials",
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const User: Model<UserDocument> =
  mongoose.models.User ?? mongoose.model<UserDocument>("User", UserSchema);
