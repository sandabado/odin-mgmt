import Link from "next/link";
import { redirect } from "next/navigation";
import { FieldFilters } from "@/components/admin/FieldFilters";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Deal = { id: string; artist_id: string | null; venue_id: string | null; deal_type: string; stage: string; event_date: string | null; guarantee_cents: number | null; notes: string | null };
type Artist = { id: string; artist_name: string };
type Venue = { id: string; venue_name: string };
const money = (cents: number | null) => cents === null ? "Value pending" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
const date = (value: string | null) => value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`)) : "Date pending";

const stages = [{ label: "Negotiating", value: "negotiating" }, { label: "Agreed", value: "agreed" }, { label: "Confirmed", value: "confirmed" }, { label: "Completed", value: "completed" }, { label: "Lost", value: "lost" }] as const;

export default async function DealsPage({ searchParams }: { searchParams: Promise<{ stage?: string }> }) {
  const { stage } = await searchParams;
  const activeStage = stages.some((item) => item.value === stage) ? stage : undefined;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/deals");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role === "artist") redirect("/admin");
  let dealQuery = supabase.from("deals").select("id, artist_id, venue_id, deal_type, stage, event_date, guarantee_cents, notes").order("event_date");
  if (activeStage) dealQuery = dealQuery.eq("stage", activeStage);
  const { data: dealData } = await dealQuery.returns<Deal[]>();
  const deals = dealData ?? [];
  const artistIds = deals.flatMap((deal) => deal.artist_id ? [deal.artist_id] : []);
  const venueIds = deals.flatMap((deal) => deal.venue_id ? [deal.venue_id] : []);
  const [{ data: artistData }, { data: venueData }] = await Promise.all([
    artistIds.length ? supabase.from("artists").select("id, artist_name").in("id", artistIds).returns<Artist[]>() : Promise.resolve({ data: [] as Artist[] }),
    venueIds.length ? supabase.from("venues").select("id, venue_name").in("id", venueIds).returns<Venue[]>() : Promise.resolve({ data: [] as Venue[] }),
  ]);
  const artists = new Map((artistData ?? []).map((artist) => [artist.id, artist]));
  const venues = new Map((venueData ?? []).map((venue) => [venue.id, venue]));

  return <main className="min-h-screen bg-void px-5 py-8 text-bone sm:px-8"><div className="mx-auto max-w-6xl"><header className="flex flex-wrap items-end justify-between gap-5 border-b border-mercury pb-6"><div><Link className="font-mono text-[10px] uppercase tracking-[.16em] text-ghost hover:text-flux" href="/admin">← Command hub</Link><p className="mt-5 font-mono text-[10px] uppercase tracking-[.18em] text-plasma">Ødin Management / deal field</p><h1 className="mt-3 font-display text-5xl leading-none">Every promise, in view.</h1></div><p className="border border-flux px-3 py-2 font-mono text-[10px] uppercase tracking-[.12em] text-flux">{deals.length} records</p></header><div className="mt-5"><FieldFilters active={activeStage} label="Stage" options={[...stages]} param="stage" /></div><section className="mt-6 grid gap-3">{deals.map((deal) => { const artist = deal.artist_id ? artists.get(deal.artist_id) : undefined; const venue = deal.venue_id ? venues.get(deal.venue_id) : undefined; return <article className="grid gap-4 border border-mercury bg-carbon p-5 sm:grid-cols-[1fr_auto] sm:items-center" key={deal.id}><div><div className="flex flex-wrap items-center gap-3"><h2 className="font-display text-3xl leading-none capitalize">{deal.deal_type.replaceAll("_", " ")}</h2><span className="border border-plasma/60 px-2 py-1 font-mono text-[8px] uppercase tracking-[.1em] text-plasma">{deal.stage}</span></div><p className="mt-2 text-sm text-ghost">{artist?.artist_name || "Artist pending"} → {venue?.venue_name || "Venue pending"} · {date(deal.event_date)}</p><p className="mt-3 max-w-2xl text-xs leading-5 text-ghost">{deal.notes || "No deal notes yet."}</p></div><div className="text-right"><p className="font-display text-3xl text-flux">{money(deal.guarantee_cents)}</p>{artist ? <Link className="mt-2 block font-mono text-[9px] uppercase tracking-[.1em] text-ghost hover:text-flux" href={`/admin/studios/${artist.id}`}>Open artist studio →</Link> : null}</div></article>; })}</section></div></main>;
}
