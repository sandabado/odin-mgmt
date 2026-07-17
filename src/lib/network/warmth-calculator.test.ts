import { describe, expect, it } from "vitest";
import { calculateWarmth } from "./warmth-calculator";

describe("calculateWarmth", () => {
  const today = new Date("2026-07-17T12:00:00");

  it("rewards recency, replies, and successful deals without exceeding 100", () => {
    expect(calculateWarmth({ lastContactDate: "2026-07-10", repliedMessages: 3, successfulDeals: 2 }, today)).toEqual({
      score: 100,
      recency: 47,
      replies: 45,
      deals: 50,
    });
  });

  it("does not create warmth from an invalid date and limits future dates to present-day recency", () => {
    expect(calculateWarmth({ lastContactDate: "invalid", repliedMessages: 0, successfulDeals: 0 }, today).score).toBe(0);
    expect(calculateWarmth({ lastContactDate: "2026-08-01", repliedMessages: 0, successfulDeals: 0 }, today).score).toBe(50);
  });
});
