import { z } from "zod";
import { SuperchargerStatusSchema } from "@/lib/contracts/supercharger";

export const StatsResponseSchema = z.object({
  total_active: z.number(),
  by_status: z.partialRecord(SuperchargerStatusSchema, z.number()),
  as_of: z.string().nullable(),
});

export type StatsResponse = z.infer<typeof StatsResponseSchema>;
