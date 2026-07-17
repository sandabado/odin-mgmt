export const studioArms = ["pr", "records", "engineering", "management"] as const;
export type StudioArm = (typeof studioArms)[number];

export const feedFirstRatios = {
  artist: 0.5,
  guild: 0.25,
  infrastructure: 0.15,
  founder: 0.1,
} as const;

export type FeedFirstAllocation = Record<keyof typeof feedFirstRatios, number>;
export type RevenueEntry = { arm: StudioArm; amountCents: number };

export function allocateFeedFirst(totalCents: number): FeedFirstAllocation {
  const total = Math.max(0, Math.round(totalCents));
  const artist = Math.floor(total * feedFirstRatios.artist);
  const guild = Math.floor(total * feedFirstRatios.guild);
  const infrastructure = Math.floor(total * feedFirstRatios.infrastructure);
  const founder = total - artist - guild - infrastructure;

  return { artist, guild, infrastructure, founder };
}

export function summarizeRevenue(entries: RevenueEntry[]) {
  const byArm: Record<StudioArm, number> = { pr: 0, records: 0, engineering: 0, management: 0 };
  for (const entry of entries) {
    if (entry.amountCents > 0) byArm[entry.arm] += entry.amountCents;
  }
  const totalCents = studioArms.reduce((total, arm) => total + byArm[arm], 0);
  return { totalCents, byArm, allocation: allocateFeedFirst(totalCents) };
}

export function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
}
