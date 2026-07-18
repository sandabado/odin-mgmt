import { ArrowDownToLine, CalendarClock, WalletCards } from "lucide-react";
import { NoArtistState, PortalEmpty, PortalMetric, PortalPageHeader, PortalStatus, portalDate, portalMoney } from "@/components/artist/PortalPrimitives";
import { getArtistPortalContext } from "@/lib/artist-portal";

export const dynamic = "force-dynamic";

type Payout = { id: string; recipient_name: string; amount_cents: number; status: string; due_on: string | null; created_at: string };
type Revenue = { id: string; amount_cents: number; received_on: string; revenue_type: string; source_reference: string | null };

export default async function ArtistRevenuePage({ searchParams }: { searchParams: Promise<{ artist?: string }> }) {
  const { artist: preferred } = await searchParams;
  const { artist, isOperations, supabase } = await getArtistPortalContext(preferred);
  if (!artist) return <NoArtistState isOperations={isOperations} />;

  const [{ data: payoutData }, { data: revenueData }] = await Promise.all([
    supabase.from("payouts").select("id, recipient_name, amount_cents, status, due_on, created_at").eq("artist_id", artist.id).eq("share", "artist").order("created_at", { ascending: false }).returns<Payout[]>(),
    supabase.from("revenue_ledger").select("id, amount_cents, received_on, revenue_type, source_reference").eq("artist_id", artist.id).order("received_on", { ascending: false }).returns<Revenue[]>(),
  ]);
  const payouts = payoutData ?? [];
  const revenue = revenueData ?? [];
  const paid = payouts.filter((item) => item.status === "paid").reduce((total, item) => total + item.amount_cents, 0);
  const pending = payouts.filter((item) => item.status !== "paid").reduce((total, item) => total + item.amount_cents, 0);
  const totalRevenue = revenue.reduce((total, item) => total + item.amount_cents, 0);

  return <><PortalPageHeader eyebrow="øDIN artist field / revenue" title="Know what is moving." copy="Your artist share, open payouts, and the income that generated them—kept clear without exposing other parties&apos; finances." detail={`${payouts.length} payouts`} /><main className="mx-auto max-w-6xl px-5 py-5 sm:px-8 sm:py-7"><section className="grid gap-3 sm:grid-cols-3"><PortalMetric label="Artist share paid" value={portalMoney(paid)} detail="Settled payouts" /><PortalMetric label="Open to you" value={portalMoney(pending)} detail="Not marked paid yet" /><PortalMetric label="Source revenue" value={portalMoney(totalRevenue)} detail="All linked income" /></section><section className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_.8fr]"><section className="border border-mercury bg-carbon p-5 sm:p-6"><div className="flex items-end justify-between gap-4 border-b border-steel pb-4"><div><p className="font-mono text-[9px] uppercase tracking-[.16em] text-plasma">Payout ledger</p><h2 className="mt-2 font-display text-3xl leading-none">What reaches you.</h2></div><WalletCards className="h-5 w-5 text-plasma" /></div>{payouts.length ? <div className="mt-5 grid gap-2">{payouts.map((payout) => <article className="grid gap-3 border border-steel bg-void/45 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center" key={payout.id}><div><p className="text-sm text-bone">{payout.recipient_name}</p><p className="mt-1 font-mono text-[8px] uppercase tracking-[.11em] text-ghost">Due / {portalDate(payout.due_on || payout.created_at)}</p></div><PortalStatus tone={payout.status === "paid" ? "good" : "warning"}>{payout.status}</PortalStatus><p className="font-display text-2xl leading-none text-flux">{portalMoney(payout.amount_cents)}</p></article>)}</div> : <PortalEmpty>Artist payouts will surface here as income is logged and split. This is a transparent readout, not a payment processor.</PortalEmpty>}</section><section className="border border-mercury bg-carbon p-5 sm:p-6"><p className="font-mono text-[9px] uppercase tracking-[.16em] text-plasma">Income signal</p><h2 className="mt-2 font-display text-3xl leading-none">Where it began.</h2>{revenue.length ? <div className="mt-5 grid gap-2">{revenue.map((entry) => <article className="border border-steel bg-void/45 p-4" key={entry.id}><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-bone">{entry.source_reference || entry.revenue_type.replaceAll("_", " ")}</p><p className="mt-1 flex items-center gap-1 font-mono text-[8px] uppercase tracking-[.1em] text-ghost"><CalendarClock className="h-3 w-3" />{portalDate(entry.received_on)}</p></div><p className="font-mono text-[10px] text-flux">{portalMoney(entry.amount_cents)}</p></div></article>)}</div> : <PortalEmpty>When a show, release, or placement generates revenue, its source will appear here beside your payout status.</PortalEmpty>}<p className="mt-5 flex items-center gap-2 border-t border-steel pt-4 text-xs leading-5 text-ghost"><ArrowDownToLine className="h-4 w-4 text-halo" />Payments remain tracked here; settlement still happens through your management team.</p></section></section></main></>;
}
