import { describe, expect, it } from "vitest";
import { allocateFeedFirst, summarizeRevenue } from "./feed-first";

describe("Feed First treasury allocation", () => {
  it("allocates every cent without exceeding the ledger total", () => {
    expect(allocateFeedFirst(101)).toEqual({ artist: 50, guild: 25, infrastructure: 15, founder: 11 });
  });

  it("summarizes each studio arm and uses the shared allocation", () => {
    expect(summarizeRevenue([
      { arm: "pr", amountCents: 1_000 },
      { arm: "records", amountCents: 2_000 },
      { arm: "engineering", amountCents: 500 },
      { arm: "management", amountCents: 1_500 },
    ])).toEqual({
      totalCents: 5_000,
      byArm: { pr: 1_000, records: 2_000, engineering: 500, management: 1_500 },
      allocation: { artist: 2_500, guild: 1_250, infrastructure: 750, founder: 500 },
    });
  });
});
