import { z } from "zod";

export const createLeadSchema = z.object({
  venueId: z.string().uuid(),
  artistId: z.string().uuid(),
  outreachDate: z.string().datetime(),
  region: z.enum(["desert", "la", "sd", "support"]),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
