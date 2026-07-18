import Link from "next/link";
import { BandOpsEmptyState, BandOpsFrame } from "@/components/admin/BandOpsFrame";
import { getBandOperationsClient } from "@/lib/band-ops-admin";

export const dynamic = "force-dynamic";

type RunSheet = {
  id: string;
  artist_id: string;
  deal_id: string | null;
  venue_address: string | null;
  load_in_time: string | null;
  soundcheck_time: string | null;
  doors_open_time: string | null;
  set_start_time: string | null;
  set_duration_minutes: number | null;
  curfew_time: string | null;
  promo_assets_ready: boolean;
  status: string;
  created_at: string;
};
type Artist = { id: string; artist_name: string };
type Deal = { id: string; deal_type: string; event_date: string | null; stage: string };

const showTime = (value: string | null) => value ? value.slice(0, 5) : "TBD";
const showDate = (value: string | null) => value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`)) : "Date pending";

export default async function RunSheetsPage() {
  const supabase = await getBandOperationsClient("/admin/band-ops/run-sheets");
  const [{ data: runSheetData }, { data: artistData }, { data: dealData }] = await Promise.all([
    supabase.from("show_run_sheets").select("id, artist_id, deal_id, venue_address, load_in_time, soundcheck_time, doors_open_time, set_start_time, set_duration_minutes, curfew_time, promo_assets_ready, status, created_at").order("created_at", { ascending: false }).returns<RunSheet[]>(),
    supabase.from("artists").select("id, artist_name").returns<Artist[]>(),
    supabase.from("deals").select("id, deal_type, event_date, stage").returns<Deal[]>(),
  ]);
  const runSheets = runSheetData ?? [];
  const artists = new Map((artistData ?? []).map((artist) => [artist.id, artist.artist_name]));
  const deals = new Map((dealData ?? []).map((deal) => [deal.id, deal]));

  return <BandOpsFrame active="/admin/band-ops/run-sheets" count={runSheets.length} countLabel="run sheets" description="Day-of clarity for every show: arrival, soundcheck, set time, settlement, and the handoff between the room and the road." eyebrow="Show coordination" title="Nothing left to guess on show day.">
    {runSheets.length ? <section className="mt-6 grid gap-3">{runSheets.map((sheet) => {
      const deal = sheet.deal_id ? deals.get(sheet.deal_id) : undefined;
      return <article className="border border-mercury bg-carbon p-5" key={sheet.id}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[.16em] text-plasma">{artists.get(sheet.artist_id) || "Artist pending"}</p>
            <h2 className="mt-2 font-display text-3xl leading-none">{deal ? deal.deal_type.replaceAll("_", " ") : "Show run sheet"}</h2>
            <p className="mt-2 text-sm text-ghost">{showDate(deal?.event_date || null)} · {sheet.venue_address || "Venue address pending"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="border border-steel px-2 py-1 font-mono text-[8px] uppercase tracking-[.1em] text-ghost">{sheet.status}</span>
            <span className={`border px-2 py-1 font-mono text-[8px] uppercase tracking-[.1em] ${sheet.promo_assets_ready ? "border-flux/60 text-flux" : "border-plasma/60 text-plasma"}`}>{sheet.promo_assets_ready ? "Promo ready" : "Promo pending"}</span>
          </div>
        </div>
        <div className="mt-5 grid gap-px border border-steel bg-steel sm:grid-cols-5">
          {[
            ["Load in", showTime(sheet.load_in_time)],
            ["Soundcheck", showTime(sheet.soundcheck_time)],
            ["Doors", showTime(sheet.doors_open_time)],
            ["Set", showTime(sheet.set_start_time)],
            ["Duration", sheet.set_duration_minutes ? `${sheet.set_duration_minutes} min` : "TBD"],
          ].map(([label, value]) => <div className="bg-void/70 p-3" key={label}><p className="font-mono text-[8px] uppercase tracking-[.12em] text-ghost">{label}</p><p className="mt-2 font-mono text-xs text-bone">{value}</p></div>)}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="font-mono text-[9px] uppercase tracking-[.1em] text-ghost">Curfew {showTime(sheet.curfew_time)} {deal ? `· deal ${deal.stage}` : ""}</p><Link className="font-mono text-[9px] uppercase tracking-[.12em] text-flux hover:text-bone" href={`/admin/studios/${sheet.artist_id}`}>Open artist studio →</Link></div>
      </article>;
    })}</section> : <BandOpsEmptyState />}
  </BandOpsFrame>;
}
