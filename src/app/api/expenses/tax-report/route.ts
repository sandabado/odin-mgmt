import { NextRequest, NextResponse } from "next/server";
import { fail } from "@/lib/api-response";
import { getSuperAdminSupabase } from "@/lib/auth/operations";

const safeDate = (value: string | null, fallback: string) => value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : fallback;
const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET(request: NextRequest) {
  const access = await getSuperAdminSupabase();
  if ("response" in access) return access.response;
  const { searchParams } = new URL(request.url);
  const year = String(new Date().getFullYear());
  const from = safeDate(searchParams.get("from"), `${year}-01-01`);
  const to = safeDate(searchParams.get("to"), `${year}-12-31`);
  const { data, error } = await access.supabase.from("expenses").select("expense_date,vendor_name,expense_category,amount_cents,tax_cents,total_cents,tax_deductible,tax_category,form_1099_required,status").gte("expense_date", from).lte("expense_date", to).order("expense_date", { ascending: true });
  if (error) return fail("SERVER_ERROR", "Unable to prepare the tax report right now.");
  const rows = ["Date,Vendor,Category,Amount,Tax,Total,Deductible,Tax category,1099 required,Status", ...(data ?? []).map((row) => [row.expense_date, row.vendor_name, row.expense_category, row.amount_cents / 100, row.tax_cents / 100, row.total_cents / 100, row.tax_deductible ? "Yes" : "No", row.tax_category, row.form_1099_required ? "Yes" : "No", row.status].map(csvCell).join(","))];
  return new NextResponse(rows.join("\n"), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename=odin-tax-expenses-${from}-to-${to}.csv` } });
}
