import { z } from "zod";
import { SuperchargerStatusSchema } from "@/lib/contracts/supercharger";

export const RecentUpdateItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  city: z.string().nullable(),
  region: z.string().nullable(),
  country: z.string().nullable().optional(),
  old_status: SuperchargerStatusSchema.nullable(),
  new_status: SuperchargerStatusSchema,
  changed_at: z.string(),
});

export type RecentUpdateItem = z.infer<typeof RecentUpdateItemSchema>;

export const RecentUpdatesResponseSchema = z.object({
  total: z.number(),
  items: z.array(RecentUpdateItemSchema),
});

export type RecentUpdatesResponse = z.infer<typeof RecentUpdatesResponseSchema>;

export const RecentUpdatesQuerySchema = z.object({
  limit: z.string().nullable().optional(),
  offset: z.string().nullable().optional(),
});

export type RecentUpdatesQuery = z.infer<typeof RecentUpdatesQuerySchema>;
