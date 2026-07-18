import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { getOperationsSupabase } from "@/lib/auth/operations";
import { checkRateLimit } from "@/lib/rate-limit";
import { createCampaignPitchSchema, validateRequestBody } from "@/lib/validators";

export async function POST(request: NextRequest, { params }: { params: Promise<{ campaignId: string }> }) {
  const bodyResult = await validateRequestBody(request, createCampaignPitchSchema);
  if (!bodyResult.success) return bodyResult.response;
  const { campaignId } = await params;
  const access = await getOperationsSupabase();
  if ("response" in access) return access.response;
  const rateLimit = checkRateLimit(`campaign-pitches:create:${access.userId}`, { limit: 80, windowMs: 60_000 });
  if (!rateLimit.allowed) return fail("RATE_LIMITED", "Too many pitch changes. Try again shortly.");
  const input = bodyResult.data;
  const { data, error } = await access.supabase.from("campaign_pitches").insert({
    campaign_id: campaignId,
    contact_id: input.contactId ?? null,
    outlet_name: input.outletName || null,
    pitch_type: input.pitchType,
    pitch_date: input.pitchDate,
    response_status: input.responseStatus,
    response_date: input.responseDate ?? null,
    notes: input.notes || null,
  }).select().single();
  if (error) return fail("SERVER_ERROR", "Unable to log this pitch right now.");
  return ok(data);
}
