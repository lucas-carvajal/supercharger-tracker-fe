import { z } from "zod";

export const ImportVersionResponseSchema = z.object({
  current_version: z.number(),
  next_expected_version: z.number(),
});

export type ImportVersionResponse = z.infer<typeof ImportVersionResponseSchema>;

export const ImportRunResponseSchema = z.object({
  status: z.string().optional(),
});

export type ImportRunResponse = z.infer<typeof ImportRunResponseSchema>;

export const ImportErrorResponseSchema = z.object({
  error: z.string().optional(),
});

export type ImportErrorResponse = z.infer<typeof ImportErrorResponseSchema>;
