import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArtistStudioTabs, type ArtistStudioTabsProps } from "@/components/admin/ArtistStudioTabs";
import type { StudioCampaign, StudioMilestone, StudioOpportunity, StudioRelease } from "@/components/admin/studio-intelligence";
import { summarizeRevenue, type StudioArm } from "@/lib/treasury/feed-first";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Artist = { id: string; profile_id: string | null; artist_name: string; genres: string[]; draw_size: number; bio: string; music_links: string[]; home_market: string; status: string };
type Project = { id: string; title: string; status: string; target_release_date: string | null; investment_cents: number; notes: string | null };
type TimelineItem = { project_id: string; phase: string; status: string; start_date: string | null; end_date: string | null; budget_allocated_cents: number | null; budget_spent_cents: number | null };
type EngineeringSession = { id: string; project_id: string; session_date: string; engineer_name: string; hours: number; cost_cents: number; notes: string | null };
type Track = { id: string; project_id: string; title: string; isrc: string | null; distribution_platforms: string[] };
type Split = { track_id: string; contributor_name: string; contributor_role: string; share_basis_points: number };
type Press = { id: string; outlet: string; article_url: string | null; published_on: string | null; estimated_reach: number | null };
type Playlist = { id: string; platform: string; playlist_name: string; added_on: string | null };
type Sync = { id: string; partner_name: string; placement_name: string; status: string; amount_cents: number | null; placed_on: string | null };
type Contract = { id: string; venue_id: string; event_date: string; guarantee_cents: number; deposit_paid_cents: number; balance_due_cents: number; status: string; signed_date: string | null; contract_reference: string };
type Venue = { id: string; venue_name: string };
type Revenue = { id: string; arm: StudioArm; amount_cents: number; received_on: string; revenue_type: string };
type Payout = { id: string; recipient_name: string; amount_cents: number; status: string; share: string; due_on: string | null; paid_on: string | null; notes: string | null };
type Deal = { id: string; deal_type: string; stage: string; event_date: string | null; guarantee_cents: number | null };
type Swap = { id: string; partner_artist_name: string; origin_market: string; partner_market: string; status: string };
type SessionNote = { id: string; session_id: string; title: string | null; content: string; author_role: string; created_at: string; requires_response: boolean };
type ProjectContributor = { id: string; project_id: string; contributor_id: string; assignment_role: string; status: string };
type StudioContributor = { id: string; full_name: string; hourly_rate_cents: number | null };
type SocialPost = { id: string; platform: string; body: string; scheduled_for: string | null; status: string };
type Expense = { id: string; project_id: string | null; vendor_name: string; expense_category: string; arm: string; total_cents: number; expense_date: string; status: string; form_1099_required: boolean };

export default async function ArtistStudioPage({ params }: { params: Promise<{ artistId: string }> }) {
  const { artistId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/admin/studios/${artistId}`);
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const { data: artist } = await supabase.from("artists").select("id, profile_id, artist_name, genres, draw_size, bio, music_links, home_market, status").eq("id", artistId).maybeSingle<Artist>();
  if (!artist) notFound();
  const isOperations = profile?.role === "super_admin" || profile?.role === "booking_director";
  if (!isOperations && !(profile?.role === "artist" && artist.profile_id === user.id)) redirect("/admin");

  const { data: projectData } = await supabase.from("projects").select("id, title, status, target_release_date, investment_cents, notes").eq("artist_id", artist.id).order("target_release_date").returns<Project[]>();
  const projects = projectData ?? [];
  const projectIds = projects.map((project) => project.id);
  const empty = <T,>() => Promise.resolve({ data: [] as T[] });
  const [timelineResult, sessionsResult, tracksResult, pressResult, playlistsResult, syncsResult, contractsResult, revenueResult, payoutsResult, dealsResult, swapsResult] = await Promise.all([
    projectIds.length ? supabase.from("project_timeline").select("project_id, phase, status, start_date, end_date, budget_allocated_cents, budget_spent_cents").in("project_id", projectIds).returns<TimelineItem[]>() : empty<TimelineItem>(),
    projectIds.length ? supabase.from("engineering_sessions").select("id, project_id, session_date, engineer_name, hours, cost_cents, notes").in("project_id", projectIds).order("session_date", { ascending: false }).returns<EngineeringSession[]>() : empty<EngineeringSession>(),
    projectIds.length ? supabase.from("release_tracks").select("id, project_id, title, isrc, distribution_platforms").in("project_id", projectIds).returns<Track[]>() : empty<Track>(),
    supabase.from("press_coverage").select("id, outlet, article_url, published_on, estimated_reach").eq("artist_id", artist.id).order("published_on", { ascending: false }).returns<Press[]>(),
    supabase.from("playlist_adds").select("id, platform, playlist_name, added_on").eq("artist_id", artist.id).order("added_on", { ascending: false }).returns<Playlist[]>(),
    supabase.from("sync_placements").select("id, partner_name, placement_name, status, amount_cents, placed_on").eq("artist_id", artist.id).order("placed_on", { ascending: false }).returns<Sync[]>(),
    supabase.from("contracts").select("id, venue_id, event_date, guarantee_cents, deposit_paid_cents, balance_due_cents, status, signed_date, contract_reference").eq("artist_id", artist.id).order("event_date").returns<Contract[]>(),
    supabase.from("revenue_ledger").select("id, arm, amount_cents, received_on, revenue_type").eq("artist_id", artist.id).order("received_on", { ascending: false }).returns<Revenue[]>(),
    supabase.from("payouts").select("id, recipient_name, amount_cents, status, share, due_on, paid_on, notes").eq("artist_id", artist.id).order("created_at", { ascending: false }).returns<Payout[]>(),
    supabase.from("deals").select("id, deal_type, stage, event_date, guarantee_cents").eq("artist_id", artist.id).order("event_date").returns<Deal[]>(),
    supabase.from("swap_deals").select("id, partner_artist_name, origin_market, partner_market, status").eq("odin_artist_id", artist.id).in("status", ["proposed", "confirmed"]).returns<Swap[]>(),
  ]);
  const [milestonesResult, releasesResult, campaignsResult, opportunitiesResult] = await Promise.all([
    projectIds.length ? supabase.from("engineering_milestones").select("id, project_id, artist_id, milestone_type, title, description, status, scheduled_date, completed_date").in("project_id", projectIds).order("scheduled_date").returns<StudioMilestone[]>() : empty<StudioMilestone>(),
    projectIds.length ? supabase.from("release_schedule").select("id, project_id, artist_id, release_type, title, release_date, status, spotify_url, apple_url, bandcamp_url, youtube_url, isrc_code, upc_code, presave_link, press_deadline, distribution_submitted, distribution_submitted_date, cover_art_url, notes").in("project_id", projectIds).order("release_date").returns<StudioRelease[]>() : empty<StudioRelease>(),
    projectIds.length ? supabase.from("campaigns").select("id, project_id, artist_id, campaign_type, title, status, start_date, end_date, target_outlets, target_playlists, pitches_sent, responses_received, coverage_secured, playlist_adds, estimated_reach, budget_cents, spent_cents, assigned_to, notes").in("project_id", projectIds).order("start_date").returns<StudioCampaign[]>() : empty<StudioCampaign>(),
    supabase.from("opportunities").select("id, artist_id, opportunity_type, title, description, status, priority, estimated_value_cents, actual_value_cents, contact_id, venue_id, identified_date, target_date, close_date, probability, assigned_to, notes").eq("artist_id", artist.id).order("target_date").returns<StudioOpportunity[]>(),
  ]);
  const tracks = tracksResult.data ?? [];
  const trackIds = tracks.map((track) => track.id);
  const { data: splitsData } = trackIds.length ? await supabase.from("publishing_splits").select("track_id, contributor_name, contributor_role, share_basis_points").in("track_id", trackIds).returns<Split[]>() : { data: [] as Split[] };
  const sessions = sessionsResult.data ?? [];
  const sessionIds = sessions.map((session) => session.id);
  const [{ data: sessionNotesData }, { data: contributorAssignmentsData }, { data: socialPostsData }, { data: expensesData }] = await Promise.all([
    sessionIds.length ? supabase.from("session_notes").select("id, session_id, title, content, author_role, created_at, requires_response").in("session_id", sessionIds).is("deleted_at", null).order("created_at", { ascending: false }).returns<SessionNote[]>() : empty<SessionNote>(),
    projectIds.length ? supabase.from("project_contributors").select("id, project_id, contributor_id, assignment_role, status").in("project_id", projectIds).returns<ProjectContributor[]>() : empty<ProjectContributor>(),
    supabase.from("social_posts").select("id, platform, body, scheduled_for, status").eq("artist_id", artist.id).order("scheduled_for", { ascending: false }).returns<SocialPost[]>(),
    projectIds.length ? supabase.from("expenses").select("id, project_id, vendor_name, expense_category, arm, total_cents, expense_date, status, form_1099_required").in("project_id", projectIds).order("expense_date", { ascending: false }).returns<Expense[]>() : empty<Expense>(),
  ]);
  const contributorAssignments = contributorAssignmentsData ?? [];
  const contributorIds = contributorAssignments.map((assignment) => assignment.contributor_id);
  const { data: contributorData } = contributorIds.length ? await supabase.from("studio_contributors").select("id, full_name, hourly_rate_cents").in("id", contributorIds).returns<StudioContributor[]>() : { data: [] as StudioContributor[] };
  const contracts = contractsResult.data ?? [];
  const venueIds = contracts.map((contract) => contract.venue_id);
  const { data: venueData } = venueIds.length ? await supabase.from("venues").select("id, venue_name").in("id", venueIds).returns<Venue[]>() : { data: [] as Venue[] };
  const timeline = timelineResult.data ?? [];
  const revenue = revenueResult.data ?? [];
  const treasury = summarizeRevenue(revenue.map((entry) => ({ arm: entry.arm, amountCents: entry.amount_cents })));
  const artistShare = Math.floor(treasury.totalCents * 0.5);
  const pendingPayouts = (payoutsResult.data ?? []).filter((payout) => payout.status !== "paid").reduce((total, payout) => total + payout.amount_cents, 0);
  const currentProject = projects.find((project) => project.status === "in_progress") ?? projects[0];
  const currentTimeline = currentProject ? timeline.filter((item) => item.project_id === currentProject.id) : [];
  const currentPhase = currentTimeline.find((item) => item.status === "in_progress")?.phase ?? currentTimeline.find((item) => item.status === "planned")?.phase ?? "development";
  const spent = currentTimeline.reduce((total, item) => total + (item.budget_spent_cents ?? 0), 0);
  const allocated = currentTimeline.reduce((total, item) => total + (item.budget_allocated_cents ?? 0), 0) || currentProject?.investment_cents || 0;
  const progress = allocated ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;
  const milestones = milestonesResult.data ?? [];
  const releases = releasesResult.data ?? [];
  const campaigns = campaignsResult.data ?? [];
  const opportunities = opportunitiesResult.data ?? [];
  const contributorById = new Map((contributorData ?? []).map((contributor) => [contributor.id, contributor]));
  const contributors = contributorAssignments.flatMap((assignment) => {
    const contributor = contributorById.get(assignment.contributor_id);
    if (!contributor) return [];
    return [{ id: assignment.id, project_id: assignment.project_id, assignment_role: assignment.assignment_role, status: assignment.status, full_name: contributor.full_name, hourly_rate_cents: contributor.hourly_rate_cents, session_count: sessions.filter((session) => session.project_id === assignment.project_id && session.engineer_name === contributor.full_name).length }];
  });
  const venueNameRecord = Object.fromEntries((venueData ?? []).map((venue) => [venue.id, venue.venue_name]));
  const studioTabs: ArtistStudioTabsProps = {
    artistId: artist.id, isOperations, projects, currentProject: currentProject ?? null, timeline, currentTimeline, currentPhase, spent, allocated, progress,
    milestones, sessions, sessionNotes: sessionNotesData ?? [], contributors, tracks, splits: splitsData ?? [], releases, campaigns,
    press: pressResult.data ?? [], playlists: playlistsResult.data ?? [], socialPosts: socialPostsData ?? [], syncs: syncsResult.data ?? [], opportunities,
    deals: dealsResult.data ?? [], contracts, venueNames: venueNameRecord, swaps: swapsResult.data ?? [], revenueTotal: treasury.totalCents, revenueByArm: treasury.byArm,
    artistShare, pendingPayouts, payouts: payoutsResult.data ?? [], expenses: expensesData ?? [],
  };

  return <main className="min-h-screen bg-void px-5 py-8 text-bone sm:px-8"><div className="mx-auto max-w-7xl"><header className="relative overflow-hidden border border-mercury bg-carbon p-6 sm:p-9"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_10%,rgba(176,38,255,.25),transparent_30%)]" /><div className="relative"><Link className="font-mono text-[10px] uppercase tracking-[.16em] text-ghost transition hover:text-flux" href="/admin/artists">← Artist directory</Link><div className="mt-8 flex flex-wrap items-end justify-between gap-6"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-plasma">Artist Studio / {artist.home_market.replaceAll("_", " ")}</p><h1 className="mt-3 font-display text-5xl leading-none sm:text-7xl">{artist.artist_name}</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-ghost">{artist.bio || "A living release, relationship, and revenue field."}</p></div><div className="border border-flux bg-void/70 p-4 font-mono text-[10px] uppercase tracking-[.13em]"><p className="text-ghost">Status</p><p className="mt-2 text-flux">● {artist.status}</p><p className="mt-5 text-ghost">Draw: {artist.draw_size.toLocaleString()}</p></div></div><div className="mt-6 flex flex-wrap gap-2">{artist.genres.map((genre) => <span className="border border-steel px-2 py-1 font-mono text-[9px] uppercase tracking-[.1em] text-ghost" key={genre}>{genre}</span>)}{artist.music_links.map((link) => <a className="border border-steel px-2 py-1 font-mono text-[9px] uppercase tracking-[.1em] text-flux hover:border-flux" href={link} key={link} rel="noreferrer" target="_blank">Listen ↗</a>)}<Link className="border border-flux px-2 py-1 font-mono text-[9px] uppercase tracking-[.1em] text-flux transition hover:bg-flux hover:text-void" href={`/artist/dashboard?artist=${artist.id}`}>Preview artist portal →</Link></div></div></header><ArtistStudioTabs {...studioTabs} /></div></main>;
}
