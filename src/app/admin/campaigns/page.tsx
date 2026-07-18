import Link from "next/link";
import { redirect } from "next/navigation";
import { CampaignCreateModal } from "@/components/admin/CampaignForms";
import { FieldFilters } from "@/components/admin/FieldFilters";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Campaign = { id: string; artist_id: string; project_id: string; deal_id: string | null; campaign_type: string; title: string; status: string; start_date: string | null; end_date: string | null; pitches_sent: number; responses_received: number; coverage_secured: number; estimated_reach: number; budget_cents: number; spent_cents: number; };
type Artist = { id: string; artist_name: string };
type Project = { id: string; artist_id: string | null; title: string };
type Deal = { id: string; artist_id: string | null; event_date: string | null };
const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
const label = (value: string) => value.replaceAll("_", " ");

export default async function CampaignsPage({ searchParams }: { searchParams: Promise<{ artist?: string; type?: string; status?: string }> }) {
  const { artist: artistFilter, type, status } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/campaigns");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role === "artist") redirect("/admin");

  let campaignQuery = supabase.from("campaigns").select("id, artist_id, project_id, deal_id, campaign_type, title, status, start_date, end_date, pitches_sent, responses_received, coverage_secured, estimated_reach, budget_cents, spent_cents").order("start_date", { ascending: false });
  if (artistFilter) campaignQuery = campaignQuery.eq("artist_id", artistFilter);
  if (type) campaignQuery = campaignQuery.eq("campaign_type", type);
  if (status) campaignQuery = campaignQuery.eq("status", status);
  const [{ data: campaignData }, { data: artistData }, { data: projectData }, { data: confirmedDealData }] = await Promise.all([
    campaignQuery.returns<Campaign[]>(),
    supabase.from("artists").select("id, artist_name").order("artist_name").returns<Artist[]>(),
    supabase.from("projects").select("id, artist_id, title").order("title").returns<Project[]>(),
    supabase.from("deals").select("id, artist_id, event_date").eq("stage", "confirmed").returns<Deal[]>(),
  ]);
  const campaigns = campaignData ?? []; const artists = artistData ?? []; const projects = projectData ?? [];
  const artistById = new Map(artists.map((artist) => [artist.id, artist]));
  const campaignDealIds = new Set(campaigns.map((campaign) => campaign.deal_id).filter((dealId): dealId is string => Boolean(dealId)));
  const unlinkedConfirmedDeals = (confirmedDealData ?? []).filter((deal) => !campaignDealIds.has(deal.id));
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "active");
  const totalPitches = campaigns.reduce((sum, campaign) => sum + campaign.pitches_sent, 0);
  const totalResponses = campaigns.reduce((sum, campaign) => sum + campaign.responses_received, 0);
  const totalCoverage = campaigns.reduce((sum, campaign) => sum + campaign.coverage_secured, 0);
  const totalBudget = activeCampaigns.reduce((sum, campaign) => sum + campaign.budget_cents, 0);
  const totalSpent = activeCampaigns.reduce((sum, campaign) => sum + campaign.spent_cents, 0);

  return <main className="min-h-screen bg-void px-5 py-8 text-bone sm:px-8"><div className="mx-auto max-w-7xl"><header className="flex flex-wrap items-end justify-between gap-5 border-b border-mercury pb-6"><div><Link className="font-mono text-[10px] uppercase tracking-[.16em] text-ghost hover:text-flux" href="/admin">← Command hub</Link><p className="mt-5 font-mono text-[10px] uppercase tracking-[.18em] text-plasma">Ødin PR / campaign desk</p><h1 className="mt-3 font-display text-5xl leading-none">Every signal, connected.</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-ghost">Shows, releases, outreach, coverage, social, and PR spend share one operating record.</p></div><CampaignCreateModal artists={artists} projects={projects} /></header>{unlinkedConfirmedDeals.length ? <section className="mt-5 border border-halo/50 bg-halo/5 p-4"><p className="font-mono text-[10px] uppercase tracking-[.13em] text-halo">New show confirmed — create campaign</p><p className="mt-2 text-sm text-ghost">{unlinkedConfirmedDeals.length} confirmed deal{unlinkedConfirmedDeals.length === 1 ? " is" : "s are"} waiting for a promotion record.</p></section> : null}<section className="mt-5 grid gap-px border border-mercury bg-mercury sm:grid-cols-2 xl:grid-cols-5"><Metric label="Pitches" value={String(totalPitches)} /><Metric label="Response rate" value={totalPitches ? `${Math.round((totalResponses / totalPitches) * 100)}%` : "—"} /><Metric label="Coverage" value={String(totalCoverage)} /><Metric label="Active budget" value={money(totalBudget)} /><Metric label="Active spent" value={money(totalSpent)} /></section><div className="mt-5 grid gap-3"><FieldFilters active={artistFilter} label="Artist" options={artists.map((artist) => ({ label: artist.artist_name, value: artist.id }))} param="artist" values={{ artist: artistFilter, type, status }} /><FieldFilters active={type} label="Type" options={["release_pr", "show_promotion", "sync_pitch", "social_media", "playlist_pitch", "radio_push", "influencer_outreach", "swap_promotion"].map((value) => ({ label: label(value), value }))} param="type" values={{ artist: artistFilter, type, status }} /><FieldFilters active={status} label="Status" options={["planning", "active", "paused", "complete", "cancelled"].map((value) => ({ label: value, value }))} param="status" values={{ artist: artistFilter, type, status }} /></div><section className="mt-6 grid gap-3">{campaigns.length ? campaigns.map((campaign) => <Link className="group border border-mercury bg-carbon p-5 transition hover:border-plasma hover:bg-steel" href={`/admin/campaigns/${campaign.id}`} key={campaign.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap gap-2 font-mono text-[9px] uppercase tracking-[.11em]"><span className="border border-plasma/50 px-2 py-1 text-plasma">{label(campaign.campaign_type)}</span><span className="border border-steel px-2 py-1 text-ghost">{campaign.status}</span></div><h2 className="mt-4 font-display text-3xl leading-none">{campaign.title}</h2><p className="mt-2 text-sm text-ghost">{artistById.get(campaign.artist_id)?.artist_name || "Artist pending"} · {campaign.start_date || "Start pending"} → {campaign.end_date || "End pending"}</p></div><span className="font-mono text-[9px] uppercase tracking-[.12em] text-flux">Open campaign →</span></div><div className="mt-5 grid grid-cols-2 gap-px border border-steel bg-steel sm:grid-cols-5">{[["Pitches", campaign.pitches_sent], ["Replies", campaign.responses_received], ["Coverage", campaign.coverage_secured], ["Reach", campaign.estimated_reach.toLocaleString()], ["Spend", `${money(campaign.spent_cents)} / ${money(campaign.budget_cents)}`]].map(([title, value]) => <div className="bg-void p-3" key={String(title)}><p className="font-mono text-[8px] uppercase tracking-[.1em] text-ghost">{title}</p><p className="mt-2 font-display text-xl leading-none">{value}</p></div>)}</div></Link>) : <section className="border border-dashed border-steel bg-carbon p-10"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-plasma">No campaigns match</p><p className="mt-4 text-sm text-ghost">Start a campaign, or clear a filter to see the whole signal field.</p></section>}</section></div></main>;
}

function Metric({ label, value }: { label: string; value: string }) { return <article className="bg-carbon p-4"><p className="font-mono text-[9px] uppercase tracking-[.12em] text-ghost">{label}</p><p className="mt-3 font-display text-3xl leading-none text-flux">{value}</p></article>; }
