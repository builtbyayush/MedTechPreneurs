import { z } from "zod";

import {
  REPORT_ACTIONS,
  REPORT_REASONS,
  SUSPENSION_DURATIONS,
} from "@/constants/reports";

export const createReportSchema = z.object({
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

/** Legacy body shape that includes reportedUserId (POST /api/reports). */
export const createReportLegacySchema = createReportSchema.extend({
  reportedUserId: z.string().trim().min(1, "Reported user is required"),
});

export const reviewReportSchema = z
  .object({
    action: z.enum(
      REPORT_ACTIONS.filter((action) => action !== "none") as [
        "dismissed",
        "warning",
        "suspension",
        "ban",
      ],
      { message: "Select a moderation action" },
    ),
    adminNotes: z
      .string()
      .trim()
      .max(2000, "Admin notes must be 2000 characters or fewer")
      .optional()
      .or(z.literal("")),
    suspensionDuration: z.enum(SUSPENSION_DURATIONS).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.action === "suspension" && !value.suspensionDuration) {
      ctx.addIssue({
        code: "custom",
        path: ["suspensionDuration"],
        message: "Choose a suspension duration",
      });
    }
  });

export type ReviewReportInput = z.infer<typeof reviewReportSchema>;
