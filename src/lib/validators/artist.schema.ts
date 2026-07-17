import { z } from "zod";

export const createArtistSchema = z.object({
  name: z.string().min(1).max(200),
  genre: z.array(z.string().min(1)).min(1),
  drawSize: z.number().int().min(0),
  bio: z.string().max(5_000),
  headshotUrl: z.string().url().optional(),
  musicLinks: z.array(z.string().url()),
  managerAssignee: z.string().uuid().optional(),
  status: z.enum(["active", "hold", "dormant"]).default("active"),
});

export type CreateArtistInput = z.infer<typeof createArtistSchema>;
