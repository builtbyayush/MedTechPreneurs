import { z } from "zod";

import { DISCOVERY_ACTIONS } from "@/models/DiscoveryAction";

export const discoveryActionSchema = z.object({
  targetUserId: z.string().min(1, "Founder id is required"),
  action: z.enum(DISCOVERY_ACTIONS, {
    message: "Action must be pass or connect",
  }),
});

export type DiscoveryActionInput = z.infer<typeof discoveryActionSchema>;
