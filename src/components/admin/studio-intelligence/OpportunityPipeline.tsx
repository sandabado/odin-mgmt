import type { OpportunityPriority, OpportunityStatus, StudioOpportunity } from "./types";
import { DataLabel, EmptyIntelligenceState, IntelligencePanel, SignalTag, StatusBadge, type SignalTone } from "./shared";
import { formatStudioCurrency, formatStudioDate, toLabel } from "./utils";

const priorityTone: Record<OpportunityPriority, SignalTone> = { low: "quiet", medium: "flux", high: "plasma", critical: "alert" };
const statusTone: Record<OpportunityStatus, SignalTone> = { identified: "quiet", researching: "halo", pitched: "plasma", in_negotiation: "plasma", verbal_yes: "flux", contract_sent: "halo", confirmed: "flux", declined: "alert", expired: "quiet" };
const path: OpportunityStatus[] = ["identified", "researching", "pitched", "in_negotiation", "verbal_yes", "contract_sent", "confirmed"];
const priorityRank: Record<OpportunityPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };

function stageIndex(status: OpportunityStatus) { return path.indexOf(status); }

export function OpportunityPipeline({
  opportunities,
  title = "Opportunity field.",
  detail = "priority · probability · next move",
  className,
}: {
  opportunities: StudioOpportunity[];
  title?: string;
  detail?: string;
  className?: string;
}) {
  const ordered = [...opportunities].sort((left, right) => priorityRank[left.priority] - priorityRank[right.priority] || (left.target_date ?? "9999").localeCompare(right.target_date ?? "9999"));
  const active = ordered.filter((opportunity) => !["declined", "expired"].includes(opportunity.status));
  const pipelineValue = active.reduce((total, opportunity) => total + (opportunity.estimated_value_cents ?? 0), 0);
  const weightedValue = active.reduce((total, opportunity) => total + ((opportunity.estimated_value_cents ?? 0) * opportunity.probability) / 100, 0);

  return <IntelligencePanel className={className} eyebrow="Management signal" title={title} detail={detail}>
    {ordered.length ? <><div className="mt-5 grid gap-px border border-steel bg-steel sm:grid-cols-3"><div className="bg-carbon p-3"><DataLabel>Active</DataLabel><p className="mt-2 font-display text-2xl">{active.length}</p></div><div className="bg-carbon p-3"><DataLabel>Pipeline value</DataLabel><p className="mt-2 font-display text-2xl">{formatStudioCurrency(pipelineValue)}</p></div><div className="bg-carbon p-3"><DataLabel>Weighted value</DataLabel><p className="mt-2 font-display text-2xl text-flux">{formatStudioCurrency(weightedValue)}</p></div></div><div className="mt-3 grid gap-3">
      {ordered.map((opportunity) => {
        const index = stageIndex(opportunity.status);
        const isTerminal = index === -1;
        return <article className="border border-steel bg-void/60 p-4" key={opportunity.id}>
          <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap gap-2"><SignalTag>{toLabel(opportunity.opportunity_type)}</SignalTag><SignalTag tone={priorityTone[opportunity.priority]}>{opportunity.priority}</SignalTag><StatusBadge tone={statusTone[opportunity.status]}>{toLabel(opportunity.status)}</StatusBadge></div><h3 className="mt-3 font-display text-2xl leading-none">{opportunity.title}</h3></div><div className="text-right"><p className="font-mono text-[10px] text-flux">{opportunity.probability}%</p><p className="mt-1 font-mono text-[8px] uppercase tracking-[.1em] text-ghost">probability</p></div></div>
          <div className="mt-4"><div className="flex gap-1">{path.map((stage, stagePosition) => <span aria-label={toLabel(stage)} className={`h-1 flex-1 ${!isTerminal && stagePosition <= index ? "bg-plasma" : "bg-steel"}`} key={stage} />)}</div><div className="mt-2 flex justify-between font-mono text-[7px] uppercase tracking-[.1em] text-ghost"><span>Identified</span><span>Confirmed</span></div></div>
          <div className="mt-4 grid gap-3 text-xs text-ghost sm:grid-cols-3"><p>Est. <span className="text-bone">{formatStudioCurrency(opportunity.estimated_value_cents)}</span></p><p>Target <span className="text-bone">{formatStudioDate(opportunity.target_date, "short")}</span></p><p>{opportunity.assigned_to_name ? <>Owner <span className="text-bone">{opportunity.assigned_to_name}</span></> : <>Identified <span className="text-bone">{formatStudioDate(opportunity.identified_date, "short")}</span></>}</p></div>
          {opportunity.description || opportunity.notes ? <p className="mt-3 text-xs leading-5 text-ghost">{opportunity.description || opportunity.notes}</p> : null}
        </article>;
      })}</div></> : <EmptyIntelligenceState>No opportunities are in the field yet. Add bookings, syncs, and partnerships here before they become deals.</EmptyIntelligenceState>}
  </IntelligencePanel>;
}
