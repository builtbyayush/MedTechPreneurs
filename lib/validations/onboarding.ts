import { z } from "zod";

import { GENDERS, USER_CATEGORIES, type UserCategory } from "@/types/user";

export const accountStepSchema = z
  .object({
    email: z.email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const categoryStepSchema = z.object({
  category: z.enum(USER_CATEGORIES, {
    message: "Select what defines you",
  }),
});

export const lookingForStepSchema = z.object({
  lookingFor: z
    .array(z.enum(USER_CATEGORIES))
    .min(1, "Select at least one option"),
});

export const profileStepSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  gender: z.enum(GENDERS, { message: "Select a gender" }),
  age: z.coerce
    .number()
    .int("Age must be a whole number")
    .min(18, "You must be at least 18")
    .max(100, "Enter a valid age"),
  profession: z
    .string()
    .trim()
    .min(2, "Enter your profession")
    .max(80),
  specialisation: z
    .string()
    .trim()
    .min(2, "Enter your specialisation")
    .max(80),
  mobile: z
    .string()
    .trim()
    .regex(
      /^(?:\+91[\s-]?)?[6-9]\d{9}$/,
      "Enter a valid Indian mobile number"
    ),
});

export const onboardingFieldsSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8).max(128),
  category: z.enum(USER_CATEGORIES),
  lookingFor: z.array(z.enum(USER_CATEGORIES)).min(1),
  name: z.string().trim().min(2).max(80),
  gender: z.enum(GENDERS),
  age: z.coerce.number().int().min(18).max(100),
  profession: z.string().trim().min(2).max(80),
  specialisation: z.string().trim().min(2).max(80),
  mobile: z
    .string()
    .trim()
    .regex(/^(?:\+91[\s-]?)?[6-9]\d{9}$/),
});

export const onboardingSchema = onboardingFieldsSchema.superRefine(
  (data, ctx) => {
    if (data.lookingFor.includes(data.category)) {
      ctx.addIssue({
        code: "custom",
        message: "lookingFor cannot include your own category",
        path: ["lookingFor"],
      });
    }
  }
);

export const onboardingFormSchema = onboardingFieldsSchema
  .safeExtend({
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
    if (data.lookingFor.includes(data.category)) {
      ctx.addIssue({
        code: "custom",
        message: "lookingFor cannot include your own category",
        path: ["lookingFor"],
      });
    }
  });

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;

export function categoriesExcluding(category: UserCategory): UserCategory[] {
  return USER_CATEGORIES.filter((item) => item !== category);
}

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
