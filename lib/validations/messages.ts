import { z } from "zod";

import { MESSAGE_CONTENT_MAX_LENGTH } from "@/lib/messaging/constants";

export const sendMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(
      MESSAGE_CONTENT_MAX_LENGTH,
      `Message must be ${MESSAGE_CONTENT_MAX_LENGTH} characters or fewer`,
    ),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
