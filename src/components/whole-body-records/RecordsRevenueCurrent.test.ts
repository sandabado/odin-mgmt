import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { feedFirstRatios } from "../../lib/treasury/feed-first";
import {
  recordsFeedFirstDestinations,
  recordsRevenueCurrents,
} from "./RecordsRevenueCurrent.data";

describe("Records public revenue current", () => {
  it("shows the four approved public opportunity currents", () => {
    expect(recordsRevenueCurrents.map((current) => current.label)).toEqual([
      "PR",
      "Records · licensing · distribution",
      "Management",
      "Booking",
    ]);
  });

  it("derives the published Feed First view from the canonical ratios", () => {
    expect(recordsFeedFirstDestinations).toEqual([
      { label: "Artist", percentage: feedFirstRatios.artist * 100 },
      { label: "Guild", percentage: feedFirstRatios.guild * 100 },
      {
        label: "Infrastructure",
        percentage: feedFirstRatios.infrastructure * 100,
      },
      {
        label: "Founder reserve",
        percentage: feedFirstRatios.founder * 100,
      },
    ]);
    expect(
      recordsFeedFirstDestinations.reduce(
        (total, destination) => total + destination.percentage,
        0,
      ),
    ).toBe(100);
  });

  it("keeps account details and private operating routes off the public map", () => {
    const source = readFileSync(
      "src/components/whole-body-records/RecordsRevenueCurrent.tsx",
      "utf8",
    );

    expect(source).toContain("not a live balance");
    expect(source).toContain("not new ØDIN ledger arms");
    expect(source).toContain("settlement remains");
    expect(source).toContain("human-controlled");
    expect(source).toContain("account activity remain protected");
    expect(source).not.toMatch(/revenue_ledger|sourceReference|amountCents/);
    expect(source).not.toContain('href="/admin');
    expect(source).not.toMatch(/\$\d/);
  });

  it("uses light SVG and honors reduced-motion preferences", () => {
    const component = readFileSync(
      "src/components/whole-body-records/RecordsRevenueCurrent.tsx",
      "utf8",
    );
    const css = readFileSync(
      "src/components/whole-body-records/RecordsRevenueCurrent.module.css",
      "utf8",
    );

    expect(component).toContain("<svg");
    expect(component).toContain("<title");
    expect(component).toContain("<desc");
    expect(component).not.toContain("<canvas");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).not.toContain("backdrop-filter");
    expect(css).not.toContain("filter: blur");
  });
});
