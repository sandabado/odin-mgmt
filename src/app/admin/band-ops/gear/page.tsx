import Link from "next/link";
import { BandOpsEmptyState, BandOpsFrame } from "@/components/admin/BandOpsFrame";
import { getBandOperationsClient } from "@/lib/band-ops-admin";

export const dynamic = "force-dynamic";

type GearItem = { id: string; artist_id: string; item_name: string; category: string; brand: string | null; model: string | null; owner: string | null; condition: string; needs_repair: boolean; repair_notes: string | null; estimated_value_cents: number | null; last_used_date: string | null; notes: string | null };
type Artist = { id: string; artist_name: string };
const money = (value: number | null) => value === null ? "Value pending" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value / 100);

export default async function GearPage() {
  const supabase = await getBandOperationsClient("/admin/band-ops/gear");
  const [{ data: gearData }, { data: artistData }] = await Promise.all([
    supabase.from("gear_inventory").select("id, artist_id, item_name, category, brand, model, owner, condition, needs_repair, repair_notes, estimated_value_cents, last_used_date, notes").order("needs_repair", { ascending: false }).order("item_name").returns<GearItem[]>(),
    supabase.from("artists").select("id, artist_name").returns<Artist[]>(),
  ]);
  const gear = gearData ?? [];
  const repairCount = gear.filter((item) => item.needs_repair).length;
  const artists = new Map((artistData ?? []).map((artist) => [artist.id, artist.artist_name]));

  return <BandOpsFrame active="/admin/band-ops/gear" count={gear.length} countLabel="gear items" description="A practical field inventory for what makes the show possible, and what needs attention before the next downbeat." eyebrow="Road readiness" title="The rig knows what it needs.">
    {gear.length ? <><section className="mt-6 grid gap-px border border-mercury bg-mercury sm:grid-cols-3"><div className="bg-carbon p-4"><p className="font-mono text-[9px] uppercase tracking-[.12em] text-ghost">Tracked</p><p className="mt-2 font-display text-3xl text-flux">{gear.length}</p></div><div className="bg-carbon p-4"><p className="font-mono text-[9px] uppercase tracking-[.12em] text-ghost">Needs repair</p><p className="mt-2 font-display text-3xl text-plasma">{repairCount}</p></div><div className="bg-carbon p-4"><p className="font-mono text-[9px] uppercase tracking-[.12em] text-ghost">Ready now</p><p className="mt-2 font-display text-3xl text-flux">{gear.length - repairCount}</p></div></section><section className="mt-4 grid gap-3">{gear.map((item) => <article className="grid gap-4 border border-mercury bg-carbon p-5 sm:grid-cols-[1fr_auto] sm:items-center" key={item.id}>
      <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-3xl leading-none">{item.item_name}</h2><span className="border border-steel px-2 py-1 font-mono text-[8px] uppercase tracking-[.1em] text-ghost">{item.category}</span>{item.needs_repair ? <span className="border border-plasma/60 px-2 py-1 font-mono text-[8px] uppercase tracking-[.1em] text-plasma">Needs repair</span> : null}</div><p className="mt-2 text-sm text-ghost">{[item.brand, item.model].filter(Boolean).join(" · ") || "Make and model pending"} · {artists.get(item.artist_id) || "Artist pending"}</p><p className="mt-3 text-xs leading-5 text-ghost">{item.repair_notes || item.notes || "No field notes yet."}</p></div>
      <div className="text-left sm:text-right"><p className="font-mono text-[9px] uppercase tracking-[.1em] text-ghost">{item.condition}</p><p className="mt-2 font-display text-2xl text-flux">{money(item.estimated_value_cents)}</p><Link className="mt-3 block font-mono text-[9px] uppercase tracking-[.12em] text-flux hover:text-bone" href={`/admin/studios/${item.artist_id}`}>Open artist studio →</Link></div>
    </article>)}</section></> : <BandOpsEmptyState />}
  </BandOpsFrame>;
}
