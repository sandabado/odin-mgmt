import { z } from "zod";
import { plainText } from "@/lib/intake-security";
import { recordsIntakeIntents } from "@/lib/records-intake";

const clean = (max: number) => z.string().max(max).transform(plainText);

export const publicIntakeSchema = z.object({
  intent: z.enum(recordsIntakeIntents).default("artist"),
  name: clean(120).pipe(z.string().min(2)),
  artistName: clean(160).pipe(z.string().min(2)),
  email: z
    .string()
    .trim()
    .email()
    .max(180)
    .transform((value) => value.toLowerCase()),
  workUrl: z.string().trim().url().max(500),
  additionalLinks: clean(1200).optional().default(""),
  message: clean(3000).pipe(z.string().min(20)),
  consent: z.literal(true),
  website: z.string().max(200).optional().default(""),
});

export type PublicIntakeInput = z.infer<typeof publicIntakeSchema>;
