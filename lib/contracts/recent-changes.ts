import { z } from "zod";
import { SuperchargerStatusSchema } from "@/lib/contracts/supercharger";

export const RecentStatusChangeSchema = z.object({
  id: z.string(),
  title: z.string(),
  city: z.string().nullable(),
  region: z.string().nullable(),
  old_status: SuperchargerStatusSchema,
  new_status: SuperchargerStatusSchema,
  changed_at: z.string(),
});

export type RecentStatusChange = z.infer<typeof RecentStatusChangeSchema>;

export const RecentStatusChangesResponseSchema = z.object({
  total: z.number(),
  items: z.array(RecentStatusChangeSchema),
});

export type RecentStatusChangesResponse = z.infer<
  typeof RecentStatusChangesResponseSchema
>;
