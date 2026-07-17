import { z } from "zod";

export const createSwapDealSchema = z.object({
  odinArtistId: z.string().uuid(),
  partnerArtistId: z.string().uuid(),
  odinMarket: z.enum(["desert", "la", "sd"]),
  partnerMarket: z.enum(["desert", "la", "sd", "other"]),
  showAVenueId: z.string().uuid().optional(),
  showADate: z.string().datetime().optional(),
  showBVenueId: z.string().uuid().optional(),
  showBDate: z.string().datetime().optional(),
  notes: z.string().max(5_000).optional(),
});

export type CreateSwapDealInput = z.infer<typeof createSwapDealSchema>;
