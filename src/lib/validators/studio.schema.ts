import { z } from "zod";

export const createEngineeringSessionSchema = z.object({
  projectId: z.string().uuid(),
  sessionDate: z.string().date(),
  engineerName: z.string().trim().min(1).max(160),
  hours: z.coerce.number().positive().max(24),
  costCents: z.coerce.number().int().min(0).max(10_000_000),
  notes: z.string().trim().max(5_000).optional(),
});
