export type WarmthInput = {
  lastContactDate?: Date | string | null;
  repliedMessages: number;
  successfulDeals: number;
};

export type WarmthBreakdown = {
  score: number;
  recency: number;
  replies: number;
  deals: number;
};

const dayInMilliseconds = 24 * 60 * 60 * 1000;

function getDaysSince(date: Date | string, referenceDate: Date) {
  const parsed = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;
  if (Number.isNaN(parsed.getTime())) return null;
  return Math.max(0, Math.floor((referenceDate.getTime() - parsed.getTime()) / dayInMilliseconds));
}

/** Mirrors the database function for previews, tests, and future dashboard UI. */
export function calculateWarmth(input: WarmthInput, referenceDate = new Date()): WarmthBreakdown {
  const daysSinceContact = input.lastContactDate ? getDaysSince(input.lastContactDate, referenceDate) : null;
  const recency = daysSinceContact === null ? 0 : Math.max(0, 50 - Math.floor(daysSinceContact / 2));
  const replies = Math.min(Math.max(0, input.repliedMessages) * 15, 45);
  const deals = Math.min(Math.max(0, input.successfulDeals) * 25, 50);

  return { score: Math.min(recency + replies + deals, 100), recency, replies, deals };
}
