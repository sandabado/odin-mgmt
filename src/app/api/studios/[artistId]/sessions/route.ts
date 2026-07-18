import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { getOperationsSupabase } from "@/lib/auth/operations";
import { checkRateLimit } from "@/lib/rate-limit";
import { createEngineeringSessionSchema, validateRequestBody } from "@/lib/validators";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest, { params }: { params: Promise<{ artistId: string }> }) {
  const { artistId } = await params;
  if (!uuidPattern.test(artistId)) return fail("VALIDATION_ERROR", "Invalid artist identifier.", "artistId");

  const bodyResult = await validateRequestBody(request, createEngineeringSessionSchema);
  if (!bodyResult.success) return bodyResult.response;

  const access = await getOperationsSupabase();
  if ("response" in access) return access.response;

  const rateLimit = checkRateLimit(`studio:sessions:${access.userId}`, { limit: 30, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    const response = fail("RATE_LIMITED", "Too many session changes. Try again shortly.");
    response.headers.set("Retry-After", String(rateLimit.retryAfterSeconds));
    return response;
  }

  const input = bodyResult.data;
  const { data: project, error: projectError } = await access.supabase
    .from("projects")
    .select("id")
    .eq("id", input.projectId)
    .eq("artist_id", artistId)
    .maybeSingle();

  if (projectError) return fail("SERVER_ERROR", "Unable to verify this project right now.");
  if (!project) return fail("NOT_FOUND", "That project does not belong to this artist.");

  const { data, error } = await access.supabase
    .from("engineering_sessions")
    .insert({
      project_id: input.projectId,
      session_date: input.sessionDate,
      engineer_name: input.engineerName,
      hours: input.hours,
      cost_cents: input.costCents,
      notes: input.notes || null,
      created_by: access.userId,
    })
    .select()
    .single();

  if (error) return fail("SERVER_ERROR", "Unable to add this session right now.");
  return ok(data);
}
