import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { getOperationsSupabase } from "@/lib/auth/operations";
import { checkRateLimit } from "@/lib/rate-limit";
import { createCampaignSocialPostSchema, validateRequestBody } from "@/lib/validators";

export async function POST(request: NextRequest, { params }: { params: Promise<{ campaignId: string }> }) {
  const bodyResult = await validateRequestBody(request, createCampaignSocialPostSchema);
  if (!bodyResult.success) return bodyResult.response;
  const { campaignId } = await params;
  const access = await getOperationsSupabase();
  if ("response" in access) return access.response;
  const rateLimit = checkRateLimit(`campaign-social:create:${access.userId}`, { limit: 50, windowMs: 60_000 });
  if (!rateLimit.allowed) return fail("RATE_LIMITED", "Too many social post changes. Try again shortly.");
  const input = bodyResult.data;
  const { data, error } = await access.supabase.from("social_posts").insert({
    campaign_id: campaignId,
    artist_id: input.artistId,
    platform: input.platform,
    body: input.body,
    media_url: input.mediaUrl || null,
    scheduled_for: input.scheduledFor ?? null,
    status: input.scheduledFor ? "scheduled" : "draft",
    created_by: access.userId,
  }).select().single();
  if (error) return fail("SERVER_ERROR", "Unable to schedule this social post right now.");
  return ok(data);
}
