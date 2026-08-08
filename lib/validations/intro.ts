import { z } from "zod";

import { INTRO_MESSAGE_MAX_LENGTH } from "@/constants/intro";

export const sendIntroductionSchema = z.object({
  targetUserId: z.string().trim().min(1, "Target profile is required"),
  content: z
    .string()
    .trim()
    .min(1, "Write a short introduction before sending.")
    .max(
      INTRO_MESSAGE_MAX_LENGTH,
      `Introduction must be ${INTRO_MESSAGE_MAX_LENGTH} characters or fewer`,
    ),
});

export type SendIntroductionInput = z.infer<typeof sendIntroductionSchema>;
