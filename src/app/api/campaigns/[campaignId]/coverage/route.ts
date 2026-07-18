import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { getOperationsSupabase } from "@/lib/auth/operations";
import { checkRateLimit } from "@/lib/rate-limit";
import { createCampaignCoverageSchema, validateRequestBody } from "@/lib/validators";

export async function POST(request: NextRequest, { params }: { params: Promise<{ campaignId: string }> }) {
  const bodyResult = await validateRequestBody(request, createCampaignCoverageSchema);
  if (!bodyResult.success) return bodyResult.response;
  const { campaignId } = await params;
  const access = await getOperationsSupabase();
  if ("response" in access) return access.response;
  const rateLimit = checkRateLimit(`campaign-coverage:create:${access.userId}`, { limit: 40, windowMs: 60_000 });
  if (!rateLimit.allowed) return fail("RATE_LIMITED", "Too many coverage changes. Try again shortly.");
  const { data: campaign, error: campaignError } = await access.supabase.from("campaigns").select("artist_id, project_id").eq("id", campaignId).maybeSingle();
  if (campaignError) return fail("SERVER_ERROR", "Unable to load this campaign right now.");
  if (!campaign) return fail("NOT_FOUND", "Campaign not found.");
  const input = bodyResult.data;
  const { data, error } = await access.supabase.from("press_coverage").insert({
    campaign_id: campaignId,
    artist_id: campaign.artist_id,
    project_id: campaign.project_id,
    outlet: input.outlet,
    article_url: input.articleUrl || null,
    published_on: input.coverageDate,
    estimated_reach: input.estimatedReach,
    notes: input.notes || null,
  }).select().single();
  if (error) return fail("SERVER_ERROR", "Unable to log coverage right now.");
  return ok(data);
}
