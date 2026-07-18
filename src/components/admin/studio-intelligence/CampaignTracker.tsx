import type { CampaignStatus, StudioCampaign } from "./types";
import { DataLabel, EmptyIntelligenceState, IntelligencePanel, SignalTag, StatusBadge, type SignalTone } from "./shared";
import { dateRangeLabel, dateRangeProgress, formatStudioCurrency, formatStudioReach, toLabel } from "./utils";

const campaignTone: Record<CampaignStatus, SignalTone> = {
  planning: "quiet",
  active: "flux",
  paused: "halo",
  complete: "plasma",
  cancelled: "alert",
};

export function CampaignTracker({
  campaigns,
  title = "Campaign pulse.",
  detail = "outreach · coverage · reach · spend",
  className,
}: {
  campaigns: StudioCampaign[];
  title?: string;
  detail?: string;
  className?: string;
}) {
  const ordered = [...campaigns].sort((left, right) => (left.status === "active" ? -1 : 0) - (right.status === "active" ? -1 : 0));

  return <IntelligencePanel className={className} eyebrow="PR signal" title={title} detail={detail}>
    {ordered.length ? <div className="mt-5 grid gap-3">
      {ordered.map((campaign) => {
        const budgetProgress = campaign.budget_cents > 0 ? Math.min(100, Math.round((campaign.spent_cents / campaign.budget_cents) * 100)) : 0;
        const campaignProgress = dateRangeProgress(campaign.start_date, campaign.end_date);
        return <article className="border border-steel bg-void/60 p-4" key={campaign.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap gap-2"><SignalTag>{toLabel(campaign.campaign_type)}</SignalTag><StatusBadge tone={campaignTone[campaign.status]}>{toLabel(campaign.status)}</StatusBadge></div>
              <h3 className="mt-3 font-display text-2xl leading-none">{campaign.title}</h3>
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[.11em] text-ghost">{dateRangeLabel(campaign.start_date, campaign.end_date)}{campaign.assigned_to_name ? ` · ${campaign.assigned_to_name}` : ""}</p>
            </div>
            {campaign.start_date && campaign.end_date ? <div className="w-20 pt-1"><div className="h-1.5 bg-steel"><div className="h-full bg-gradient-to-r from-plasma to-flux" style={{ width: `${campaignProgress}%` }} /></div><p className="mt-2 text-right font-mono text-[8px] text-ghost">{campaignProgress}%</p></div> : null}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-px border border-steel bg-steel sm:grid-cols-5">
            {[["Pitches", campaign.pitches_sent], ["Replies", campaign.responses_received], ["Coverage", campaign.coverage_secured], ["Playlists", campaign.playlist_adds], ["Reach", formatStudioReach(campaign.estimated_reach)]].map(([label, value]) => <div className="bg-carbon p-3" key={String(label)}><DataLabel>{label}</DataLabel><p className="mt-2 font-display text-xl leading-none text-bone">{value}</p></div>)}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div><DataLabel>Outlet targets</DataLabel><div className="mt-2 flex flex-wrap gap-1.5">{campaign.target_outlets.length ? campaign.target_outlets.map((outlet) => <SignalTag key={outlet}>{outlet}</SignalTag>) : <span className="text-xs text-ghost">No outlet list yet.</span>}</div></div>
            <div><DataLabel>Playlist targets</DataLabel><div className="mt-2 flex flex-wrap gap-1.5">{campaign.target_playlists.length ? campaign.target_playlists.map((playlist) => <SignalTag key={playlist}>{playlist}</SignalTag>) : <span className="text-xs text-ghost">No playlist list yet.</span>}</div></div>
          </div>
          <div className="mt-4 border-t border-steel pt-3"><div className="flex items-center justify-between gap-3"><DataLabel>Budget signal</DataLabel><p className="font-mono text-[9px] text-flux">{formatStudioCurrency(campaign.spent_cents)} / {formatStudioCurrency(campaign.budget_cents)}</p></div><div className="mt-2 h-1.5 bg-steel"><div className="h-full bg-flux" style={{ width: `${budgetProgress}%` }} /></div></div>
          {campaign.notes ? <p className="mt-3 text-xs leading-5 text-ghost">{campaign.notes}</p> : null}
        </article>;
      })}
    </div> : <EmptyIntelligenceState>No campaigns are in motion. Plan the first release push and its targets, signal, and spend will live here.</EmptyIntelligenceState>}
  </IntelligencePanel>;
}
