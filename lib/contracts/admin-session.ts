import { z } from "zod";

export const AdminSessionSchema = z.object({
  sub: z.literal("admin"),
  exp: z.number(),
});

export type AdminSession = z.infer<typeof AdminSessionSchema>;
