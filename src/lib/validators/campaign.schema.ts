import { z } from "zod";

export const campaignTypes = ["release_pr", "show_promotion", "sync_pitch", "social_media", "playlist_pitch", "radio_push", "influencer_outreach", "swap_promotion"] as const;
export const campaignStatuses = ["planning", "active", "paused", "complete", "cancelled"] as const;
const nullableUuid = z.string().uuid().nullable().optional();
const nullableDate = z.string().date().nullable().optional();

export const createCampaignSchema = z.object({
  projectId: z.string().uuid(),
  artistId: z.string().uuid(),
  campaignType: z.enum(campaignTypes),
  title: z.string().trim().min(1).max(240),
  status: z.enum(campaignStatuses).default("planning"),
  startDate: nullableDate,
  endDate: nullableDate,
  pressDeadline: nullableDate,
  budgetCents: z.coerce.number().int().min(0).max(100_000_000).default(0),
  spentCents: z.coerce.number().int().min(0).max(100_000_000).default(0),
  notes: z.string().trim().max(10_000).optional(),
  dealId: nullableUuid,
  releaseScheduleId: nullableUuid,
  swapDealId: nullableUuid,
});

export const updateCampaignSchema = z.object({
  status: z.enum(campaignStatuses).optional(),
  budgetCents: z.coerce.number().int().min(0).max(100_000_000).optional(),
  spentCents: z.coerce.number().int().min(0).max(100_000_000).optional(),
  notes: z.string().trim().max(10_000).nullable().optional(),
}).refine((value) => Object.keys(value).length > 0, "Choose at least one campaign field to update.");

export const createCampaignPitchSchema = z.object({
  contactId: nullableUuid,
  outletName: z.string().trim().max(240).optional(),
  pitchType: z.enum(["email", "phone", "in_person", "social_dm"]).default("email"),
  pitchDate: z.string().date(),
  responseStatus: z.enum(["pending", "positive", "negative", "ghost", "coverage_secured"]).default("pending"),
  responseDate: nullableDate,
  notes: z.string().trim().max(10_000).optional(),
});

export const createCampaignCoverageSchema = z.object({
  outlet: z.string().trim().min(1).max(240),
  articleUrl: z.string().url().max(2_000).optional(),
  coverageDate: z.string().date(),
  estimatedReach: z.coerce.number().int().min(0).max(2_000_000_000).default(0),
  notes: z.string().trim().max(10_000).optional(),
});

export const createCampaignSocialPostSchema = z.object({
  artistId: z.string().uuid(),
  platform: z.enum(["instagram", "facebook", "tiktok", "youtube", "x", "threads", "linkedin", "other"]),
  body: z.string().trim().min(1).max(10_000),
  mediaUrl: z.string().url().max(2_000).optional(),
  scheduledFor: z.string().datetime().nullable().optional(),
});
