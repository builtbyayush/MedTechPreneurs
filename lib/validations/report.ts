import { z } from "zod";

import { REPORT_REASONS } from "@/constants/reports";

export const createReportSchema = z.object({
  reportedUserId: z.string().trim().min(1, "Reported user is required"),
  reason: z.enum(REPORT_REASONS, {
    message: "Select a report reason",
  }),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer")
    .optional()
    .or(z.literal("")),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

export const discoverySearchSchema = z.object({
  q: z.string().trim().min(2, "Enter at least 2 characters").max(80),
});
