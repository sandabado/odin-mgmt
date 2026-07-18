import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { getOperationsSupabase } from "@/lib/auth/operations";
import { checkRateLimit } from "@/lib/rate-limit";
import { updateExpenseSchema, validateRequestBody } from "@/lib/validators";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ expenseId: string }> }) {
  const bodyResult = await validateRequestBody(request, updateExpenseSchema);
  if (!bodyResult.success) return bodyResult.response;
  const access = await getOperationsSupabase();
  if ("response" in access) return access.response;
  if (!checkRateLimit(`expenses:update:${access.userId}`, { limit: 60, windowMs: 60_000 }).allowed) return fail("RATE_LIMITED", "Too many expense changes. Try again shortly.");
  const { expenseId } = await params; const input = bodyResult.data;
  const update = {
    ...(input.status === undefined ? {} : { status: input.status, ...(input.status === "approved" ? { approved_by: access.userId, approved_at: new Date().toISOString() } : {}) }),
    ...(input.paidDate === undefined ? {} : { paid_date: input.paidDate }),
    ...(input.internalNotes === undefined ? {} : { internal_notes: input.internalNotes }),
  };
  const { data, error } = await access.supabase.from("expenses").update(update).eq("id", expenseId).select().maybeSingle();
  if (error) return fail("SERVER_ERROR", "Unable to update this expense right now.");
  if (!data) return fail("NOT_FOUND", "Expense not found.");
  return ok(data);
}
