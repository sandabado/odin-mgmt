import { describe, expect, it } from "vitest";
import { buildTreasuryFlow } from "./water-flow";

const ledger = [
  {
    amountCents: 10_001,
    id: "revenue-1",
    receivedOn: "2026-07-29",
    revenueType: "direct_sale",
    sourceReference: "Order 001",
  },
] as const;

const payouts = [
  {
    amountCents: 5_000,
    revenueLedgerId: "revenue-1",
    share: "artist",
    status: "pending",
  },
  {
    amountCents: 2_500,
    revenueLedgerId: "revenue-1",
    share: "guild",
    status: "pending",
  },
  {
    amountCents: 1_500,
    revenueLedgerId: "revenue-1",
    share: "infra",
    status: "pending",
  },
  {
    amountCents: 1_001,
    revenueLedgerId: "revenue-1",
    share: "founder",
    status: "pending",
  },
] as const;

describe("Treasury water-flow projection", () => {
  it("maps the stored ledger and payouts without recalculating the split", () => {
    expect(buildTreasuryFlow(ledger, payouts)).toMatchObject({
      allocatedCents: 10_001,
      inflowCents: 10_001,
      transactionCount: 1,
      unallocatedCents: 0,
      buckets: [
        { amountCents: 5_000, share: "artist" },
        { amountCents: 2_500, share: "guild" },
        { amountCents: 1_500, share: "infra" },
        { amountCents: 1_001, share: "founder" },
      ],
    });
  });

  it("keeps hidden artist-portal allocations private instead of calling them missing", () => {
    expect(
      buildTreasuryFlow(ledger, payouts, {
        completeAllocationSet: false,
        visibleShares: ["artist"],
      }),
    ).toMatchObject({
      allocatedCents: 5_000,
      inflowCents: 10_001,
      unallocatedCents: null,
      buckets: [{ amountCents: 5_000, share: "artist" }],
    });
  });

  it("excludes expense rows from incoming water", () => {
    expect(
      buildTreasuryFlow(
        [
          ...ledger,
          {
            amountCents: 2_000,
            id: "expense-1",
            receivedOn: "2026-07-29",
            revenueType: "expense",
            sourceReference: "Studio rental",
          },
        ],
        payouts,
      ).inflowCents,
    ).toBe(10_001);
  });
});
