import { z } from "zod";

export const expenseCategories = ["studio_rental", "engineering_services", "mixing_mastering", "session_musician", "equipment_purchase", "equipment_rental", "software_subscription", "streaming_distribution", "marketing_advertising", "pr_services", "photography_video", "merch_production", "travel_lodging", "meals_per_diem", "legal_accounting", "insurance", "office_supplies", "education_training", "contractor_payment", "royalty_payment", "sync_submission", "festival_submission", "other"] as const;
export const expenseArms = ["engineering", "records", "pr", "management", "central"] as const;
export const expenseStatuses = ["pending", "approved", "paid", "disputed", "rejected"] as const;
const optionalUuid = z.string().uuid().nullable().optional();
const optionalDate = z.string().date().nullable().optional();

export const createExpenseSchema = z.object({
  expenseCategory: z.enum(expenseCategories),
  arm: z.enum(expenseArms),
  projectId: optionalUuid,
  artistId: optionalUuid,
  campaignId: optionalUuid,
  vendorName: z.string().trim().min(1).max(240),
  amountCents: z.coerce.number().int().min(0).max(100_000_000),
  taxCents: z.coerce.number().int().min(0).max(100_000_000).default(0),
  expenseDate: z.string().date(),
  dueDate: optionalDate,
  paymentMethod: z.enum(["cash", "check", "ach_transfer", "wire_transfer", "credit_card", "debit_card", "venmo", "paypal", "stripe", "zelle", "other"]).nullable().optional(),
  receiptUrl: z.string().url().max(2_000).nullable().optional(),
  invoiceNumber: z.string().trim().max(160).nullable().optional(),
  invoiceUrl: z.string().url().max(2_000).nullable().optional(),
  taxDeductible: z.boolean().default(true),
  taxCategory: z.string().trim().max(120).nullable().optional(),
  form1099Required: z.boolean().default(false),
  isReimbursement: z.boolean().default(false),
  reimbursedTo: z.string().trim().max(240).nullable().optional(),
  description: z.string().trim().max(10_000).nullable().optional(),
});

export const updateExpenseSchema = z.object({
  status: z.enum(expenseStatuses).optional(),
  paidDate: optionalDate,
  internalNotes: z.string().trim().max(10_000).nullable().optional(),
}).refine((value) => Object.keys(value).length > 0, "Choose at least one expense field to update.");
