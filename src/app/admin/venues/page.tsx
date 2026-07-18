import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Venue = { id: string; venue_name: string; city_state: string; capacity: number; status: string; network_role: string | null; guarantee_min_cents: number | null; guarantee_range_cents: number | null; notes: string | null };
const money = (cents: number | null) => cents === null ? "TBD" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);

export default async function VenuesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/venues");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role === "artist") redirect("/admin");
  const { data } = await supabase.from("venues").select("id, venue_name, city_state, capacity, status, network_role, guarantee_min_cents, guarantee_range_cents, notes").order("status").order("venue_name").returns<Venue[]>();
  const venues = data ?? [];

  return <main className="min-h-screen bg-void px-5 py-8 text-bone sm:px-8"><div className="mx-auto max-w-6xl"><header className="flex flex-wrap items-end justify-between gap-5 border-b border-mercury pb-6"><div><Link className="font-mono text-[10px] uppercase tracking-[.16em] text-ghost hover:text-flux" href="/admin">← Command hub</Link><p className="mt-5 font-mono text-[10px] uppercase tracking-[.18em] text-plasma">Ødin Management / venue field</p><h1 className="mt-3 font-display text-5xl leading-none">Rooms worth returning to.</h1></div><p className="border border-flux px-3 py-2 font-mono text-[10px] uppercase tracking-[.12em] text-flux">{venues.length} rooms</p></header><section className="mt-6 grid gap-3">{venues.map((venue) => <article className="grid gap-4 border border-mercury bg-carbon p-5 sm:grid-cols-[1fr_auto] sm:items-center" key={venue.id}><div><div className="flex flex-wrap items-center gap-3"><h2 className="font-display text-3xl leading-none">{venue.venue_name}</h2><span className="border border-steel px-2 py-1 font-mono text-[8px] uppercase tracking-[.1em] text-ghost">{venue.status}</span></div><p className="mt-2 text-sm text-ghost">{venue.city_state} · {venue.capacity.toLocaleString()} cap · {venue.network_role || "Network role pending"}</p><p className="mt-3 max-w-2xl text-xs leading-5 text-ghost">{venue.notes || "No relationship notes yet."}</p></div><div className="font-mono text-[10px] uppercase tracking-[.1em] text-flux">{money(venue.guarantee_min_cents)} — {money(venue.guarantee_range_cents)}</div></article>)}</section></div></main>;
}
