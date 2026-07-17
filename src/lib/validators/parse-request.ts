import type { NextRequest } from "next/server";
import type { z } from "zod";
import { fail } from "@/lib/api-response";

type ValidatedRequest<T> =
  | { success: true; data: T }
  | { success: false; response: ReturnType<typeof fail> };

/**
 * The only body parser for Odin JSON API routes. It turns malformed JSON and
 * Zod failures into the standard API envelope, including the input field when
 * it is known.
 */
export async function validateRequestBody<TSchema extends z.ZodType>(
  request: NextRequest,
  schema: TSchema,
): Promise<ValidatedRequest<z.output<TSchema>>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return { success: false, response: fail("VALIDATION_ERROR", "Request body must be valid JSON.") };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path.map(String).join(".") || undefined;
    return { success: false, response: fail("VALIDATION_ERROR", issue?.message ?? "Invalid request body.", field) };
  }

  return { success: true, data: parsed.data };
}
