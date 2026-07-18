import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { getOperationsSupabase } from "@/lib/auth/operations";
import { checkRateLimit } from "@/lib/rate-limit";
import { updateCampaignSchema, validateRequestBody } from "@/lib/validators";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ campaignId: string }> }) {
  const bodyResult = await validateRequestBody(request, updateCampaignSchema);
  if (!bodyResult.success) return bodyResult.response;
  const { campaignId } = await params;
  const access = await getOperationsSupabase();
  if ("response" in access) return access.response;
  const rateLimit = checkRateLimit(`campaigns:update:${access.userId}`, { limit: 60, windowMs: 60_000 });
  if (!rateLimit.allowed) return fail("RATE_LIMITED", "Too many campaign changes. Try again shortly.");
  const input = bodyResult.data;
  const update = {
    ...(input.status === undefined ? {} : { status: input.status }),
    ...(input.budgetCents === undefined ? {} : { budget_cents: input.budgetCents }),
    ...(input.spentCents === undefined ? {} : { spent_cents: input.spentCents }),
    ...(input.notes === undefined ? {} : { notes: input.notes }),
  };
  const { data, error } = await access.supabase.from("campaigns").update(update).eq("id", campaignId).select().maybeSingle();
  if (error) return fail("SERVER_ERROR", "Unable to update this campaign right now.");
  if (!data) return fail("NOT_FOUND", "Campaign not found.");
  return ok(data);
}
