import { z } from "zod";

export const contactCategories = [
  "sync_agent", "marketer", "publisher", "distributor", "lawyer",
  "tour_agent", "promoter", "booker", "venue_manager", "artist",
  "manager", "press", "radio_dj", "playlist_curator", "festival_booker",
] as const;

export const contactRegions = ["los_angeles", "san_diego", "desert", "nashville", "new_york", "london", "other"] as const;

export const createContactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  company: z.string().trim().max(200).optional(),
  category: z.enum(contactCategories),
  email: z.string().trim().email(),
  phone: z.string().trim().max(50).optional(),
  website: z.string().url().optional(),
  instagram: z.string().trim().max(100).optional(),
  twitter: z.string().trim().max(100).optional(),
  linkedin: z.string().url().optional(),
  location: z.string().trim().max(200).optional(),
  region: z.enum(contactRegions).optional(),
  genreFocus: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  tags: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
  notes: z.string().max(10_000).optional(),
  lastContactDate: z.string().date().optional(),
  nextOutreach: z.string().date().optional(),
});

export const updateContactSchema = createContactSchema.partial();

export const contactListQuerySchema = z.object({
  category: z.enum(contactCategories).optional(),
  region: z.enum(contactRegions).optional(),
  search: z.string().trim().min(1).max(200).optional(),
  minWarmth: z.coerce.number().int().min(0).max(100).optional(),
}).strict();

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
