import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { getSuperAdminSupabase } from "@/lib/auth/operations";
import { checkRateLimit } from "@/lib/rate-limit";
import { createExpenseSchema, validateRequestBody } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const bodyResult = await validateRequestBody(request, createExpenseSchema);
  if (!bodyResult.success) return bodyResult.response;
  const access = await getSuperAdminSupabase();
  if ("response" in access) return access.response;
  if (!checkRateLimit(`expenses:create:${access.userId}`, { limit: 30, windowMs: 60_000 }).allowed) return fail("RATE_LIMITED", "Too many expense changes. Try again shortly.");
  const input = bodyResult.data;
  const { data, error } = await access.supabase.from("expenses").insert({
    expense_category: input.expenseCategory, arm: input.arm, project_id: input.projectId ?? null, artist_id: input.artistId ?? null, campaign_id: input.campaignId ?? null,
    vendor_name: input.vendorName, amount_cents: input.amountCents, tax_cents: input.taxCents, expense_date: input.expenseDate, due_date: input.dueDate ?? null,
    payment_method: input.paymentMethod ?? null, receipt_url: input.receiptUrl ?? null, invoice_number: input.invoiceNumber ?? null, invoice_url: input.invoiceUrl ?? null,
    tax_deductible: input.taxDeductible, tax_category: input.taxCategory ?? null, form_1099_required: input.form1099Required,
    is_reimbursement: input.isReimbursement, reimbursed_to: input.reimbursedTo ?? null, description: input.description ?? null, created_by: access.userId,
  }).select().single();
  if (error) return fail("SERVER_ERROR", "Unable to create this expense right now.");
  return ok(data);
}
