export const treasuryShareOrder = [
  "artist",
  "guild",
  "infra",
  "founder",
  "other",
] as const;

export type TreasuryShare = (typeof treasuryShareOrder)[number];

export interface TreasuryLedgerFlowRow {
  id: string;
  amountCents: number;
  receivedOn: string;
  revenueType: string;
  sourceReference: string | null;
}

export interface TreasuryPayoutFlowRow {
  amountCents: number;
  revenueLedgerId: string | null;
  share: TreasuryShare;
  status: string;
}

export interface TreasuryFlowAllocation {
  amountCents: number;
  share: TreasuryShare;
  status: string;
}

export interface TreasuryFlowTransaction {
  allocations: TreasuryFlowAllocation[];
  amountCents: number;
  id: string;
  receivedOn: string;
  revenueType: string;
  sourceReference: string | null;
}

export interface TreasuryFlowBucket {
  amountCents: number;
  percentage: number;
  share: TreasuryShare;
  transactions: Array<{
    amountCents: number;
    id: string;
    receivedOn: string;
    sourceAmountCents: number;
    sourceLabel: string;
    status: string;
  }>;
}

export interface TreasuryFlowModel {
  allocatedCents: number;
  buckets: TreasuryFlowBucket[];
  inflowCents: number;
  transactionCount: number;
  unallocatedCents: number | null;
}

export interface BuildTreasuryFlowOptions {
  /**
   * Set false for an artist-scoped model. Artist RLS intentionally returns
   * only the artist share, so hidden internal shares are not "unallocated."
   */
  completeAllocationSet?: boolean;
  visibleShares?: readonly TreasuryShare[];
}

function sourceLabel(entry: TreasuryLedgerFlowRow) {
  return (
    entry.sourceReference?.trim() ||
    entry.revenueType.replaceAll("_", " ")
  );
}

/**
 * Joins the durable revenue ledger to its generated payouts without
 * recalculating or changing the deployed Feed First split.
 */
export function buildTreasuryFlow(
  ledger: readonly TreasuryLedgerFlowRow[],
  payouts: readonly TreasuryPayoutFlowRow[],
  {
    completeAllocationSet = true,
    visibleShares = treasuryShareOrder,
  }: BuildTreasuryFlowOptions = {},
): TreasuryFlowModel {
  const visible = new Set(visibleShares);
  const payoutsByLedger = new Map<string, TreasuryPayoutFlowRow[]>();

  for (const payout of payouts) {
    if (!payout.revenueLedgerId || !visible.has(payout.share)) continue;
    const existing = payoutsByLedger.get(payout.revenueLedgerId) ?? [];
    existing.push(payout);
    payoutsByLedger.set(payout.revenueLedgerId, existing);
  }

  const transactions: TreasuryFlowTransaction[] = ledger
    .filter((entry) => entry.amountCents > 0 && entry.revenueType !== "expense")
    .map((entry) => ({
      allocations: (payoutsByLedger.get(entry.id) ?? []).map((payout) => ({
        amountCents: Math.max(0, Math.round(payout.amountCents)),
        share: payout.share,
        status: payout.status,
      })),
      amountCents: Math.max(0, Math.round(entry.amountCents)),
      id: entry.id,
      receivedOn: entry.receivedOn,
      revenueType: entry.revenueType,
      sourceReference: entry.sourceReference,
    }));

  const inflowCents = transactions.reduce(
    (total, transaction) => total + transaction.amountCents,
    0,
  );

  const buckets = treasuryShareOrder.flatMap((share) => {
    if (!visible.has(share)) return [];
    const transactionRows = transactions.flatMap((transaction) => {
      const allocation = transaction.allocations.find(
        (candidate) => candidate.share === share,
      );
      if (!allocation) return [];
      return [
        {
          amountCents: allocation.amountCents,
          id: transaction.id,
          receivedOn: transaction.receivedOn,
          sourceAmountCents: transaction.amountCents,
          sourceLabel: sourceLabel(transaction),
          status: allocation.status,
        },
      ];
    });
    const amountCents = transactionRows.reduce(
      (total, transaction) => total + transaction.amountCents,
      0,
    );
    if (!amountCents && !transactionRows.length) return [];
    return [
      {
        amountCents,
        percentage:
          inflowCents > 0 ? (amountCents / inflowCents) * 100 : 0,
        share,
        transactions: transactionRows,
      },
    ];
  });

  const allocatedCents = buckets.reduce(
    (total, bucket) => total + bucket.amountCents,
    0,
  );

  return {
    allocatedCents,
    buckets,
    inflowCents,
    transactionCount: transactions.length,
    unallocatedCents: completeAllocationSet
      ? inflowCents - allocatedCents
      : null,
  };
}
