import { z } from "zod";

export const createVenueSchema = z.object({
  name: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  state: z.string().length(2),
  capacity: z.number().int().min(0).max(100_000),
  contactPerson: z.string().max(200).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  region: z.enum(["desert", "la", "sd", "support"]),
  networkRole: z.enum(["target", "host", "exchange", "showcase"]).default("target"),
  guaranteeRangeCents: z.object({
    min: z.number().int().min(0).optional(),
    max: z.number().int().min(0).optional(),
  }).optional(),
  techRiderNotes: z.string().max(5_000).optional(),
});

export type CreateVenueInput = z.infer<typeof createVenueSchema>;
