import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { getOperationsSupabase } from "@/lib/auth/operations";
import { checkRateLimit } from "@/lib/rate-limit";
import { createCampaignSchema, validateRequestBody } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const bodyResult = await validateRequestBody(request, createCampaignSchema);
  if (!bodyResult.success) return bodyResult.response;
  const access = await getOperationsSupabase();
  if ("response" in access) return access.response;
  const rateLimit = checkRateLimit(`campaigns:create:${access.userId}`, { limit: 30, windowMs: 60_000 });
  if (!rateLimit.allowed) return fail("RATE_LIMITED", "Too many campaign changes. Try again shortly.");

  const input = bodyResult.data;
  const { data: artist } = input.campaignType === "sync_pitch" ? await access.supabase.from("artists").select("disco_link").eq("id", input.artistId).maybeSingle() : { data: null };
  const syncCatalogLine = artist?.disco_link ? `Listen to full catalog: ${artist.disco_link}` : null;
  const { data, error } = await access.supabase.from("campaigns").insert({
    project_id: input.projectId,
    artist_id: input.artistId,
    campaign_type: input.campaignType,
    title: input.title,
    status: input.status,
    start_date: input.startDate ?? null,
    end_date: input.endDate ?? null,
    press_deadline: input.pressDeadline ?? null,
    budget_cents: input.budgetCents,
    spent_cents: input.spentCents,
    notes: [input.notes, syncCatalogLine].filter(Boolean).join("\n\n") || null,
    deal_id: input.dealId ?? null,
    release_schedule_id: input.releaseScheduleId ?? null,
    swap_deal_id: input.swapDealId ?? null,
  }).select().single();
  if (error) return fail("SERVER_ERROR", "Unable to create this campaign right now.");
  return ok(data);
}
