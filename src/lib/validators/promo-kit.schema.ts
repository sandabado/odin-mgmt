import { z } from "zod";

export const createPromoKitSchema = z.object({
  artistId: z.string().uuid(),
  title: z.string().min(1).max(200),
  type: z.enum(["show_promo", "album_release", "general"]),
  eventDate: z.string().datetime().optional(),
  eventVenue: z.string().max(200).optional(),
  captionTemplate: z.string().max(2_000).optional(),
  swapDealId: z.string().uuid().optional(),
});

export type CreatePromoKitInput = z.infer<typeof createPromoKitSchema>;
