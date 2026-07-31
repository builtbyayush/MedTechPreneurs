import { z } from "zod";

import { EMAIL_VERIFICATION } from "@/config/email";

export const verifyEmailCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(
      new RegExp(`^\\d{${EMAIL_VERIFICATION.codeLength}}$`),
      `Enter the ${EMAIL_VERIFICATION.codeLength}-digit code`,
    ),
});
