import { z } from "zod";

export const SuperchargerStatusSchema = z.enum([
  "IN_DEVELOPMENT",
  "UNDER_CONSTRUCTION",
  "UNKNOWN",
  "OPENED",
  "REMOVED",
]);

export type SuperchargerStatus = z.infer<typeof SuperchargerStatusSchema>;

export const SuperchargerSchema = z.object({
  id: z.string(),
  title: z.string(),
  city: z.string().nullable(),
  region: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  status: SuperchargerStatusSchema,
  raw_status_value: z.string(),
  tesla_url: z.string(),
  first_seen_at: z.string(),
  last_scraped_at: z.string(),
  details_fetch_failed: z.boolean(),
});

export type Supercharger = z.infer<typeof SuperchargerSchema>;

export const SuperchargerMapItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  status: SuperchargerStatusSchema,
});

export type SuperchargerMapItem = z.infer<typeof SuperchargerMapItemSchema>;

export const SuperchargerMapItemsSchema = z.array(SuperchargerMapItemSchema);

export const SuperchargerStatusHistoryEntrySchema = z.object({
  old_status: SuperchargerStatusSchema.nullable(),
  new_status: SuperchargerStatusSchema,
  changed_at: z.string(),
});

export type SuperchargerStatusHistoryEntry = z.infer<
  typeof SuperchargerStatusHistoryEntrySchema
>;

export const SuperchargerDetailSchema = SuperchargerSchema.extend({
  status_history: z.array(SuperchargerStatusHistoryEntrySchema),
});

export type SuperchargerDetail = z.infer<typeof SuperchargerDetailSchema>;

export const SuperchargersSoonResponseSchema = z.object({
  total: z.number(),
  items: z.array(SuperchargerSchema),
});

export type SuperchargersSoonResponse = z.infer<
  typeof SuperchargersSoonResponseSchema
>;

export const SuperchargersSoonQuerySchema = z.object({
  limit: z.string().nullable().optional(),
  offset: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
});

export type SuperchargersSoonQuery = z.infer<
  typeof SuperchargersSoonQuerySchema
>;
