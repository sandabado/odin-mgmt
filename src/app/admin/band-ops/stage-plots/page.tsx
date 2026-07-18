import Link from "next/link";
import { BandOpsEmptyState, BandOpsFrame } from "@/components/admin/BandOpsFrame";
import { getBandOperationsClient } from "@/lib/band-ops-admin";

export const dynamic = "force-dynamic";

type StagePlot = { id: string; artist_id: string; name: string; inputs: unknown; stage_layout: string | null; member_positions: unknown; power_requirements: string | null; special_needs: string | null; plot_diagram_url: string | null; input_list_pdf_url: string | null; is_active: boolean; version: number; updated_at: string };
type Artist = { id: string; artist_name: string };

const listCount = (value: unknown) => Array.isArray(value) ? value.length : 0;

export default async function StagePlotsPage() {
  const supabase = await getBandOperationsClient("/admin/band-ops/stage-plots");
  const [{ data: plotData }, { data: artistData }] = await Promise.all([
    supabase.from("stage_plots").select("id, artist_id, name, inputs, stage_layout, member_positions, power_requirements, special_needs, plot_diagram_url, input_list_pdf_url, is_active, version, updated_at").order("updated_at", { ascending: false }).returns<StagePlot[]>(),
    supabase.from("artists").select("id, artist_name").returns<Artist[]>(),
  ]);
  const plots = plotData ?? [];
  const artists = new Map((artistData ?? []).map((artist) => [artist.id, artist.artist_name]));

  return <BandOpsFrame active="/admin/band-ops/stage-plots" count={plots.length} countLabel="stage plots" description="A clear technical language between artist, crew, and room—before the first case hits the stage." eyebrow="Technical readiness" title="Every room gets the right shape.">
    {plots.length ? <section className="mt-6 grid gap-4 lg:grid-cols-2">{plots.map((plot) => <article className="border border-mercury bg-carbon p-5" key={plot.id}>
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-[9px] uppercase tracking-[.16em] text-plasma">{artists.get(plot.artist_id) || "Artist pending"}</p><h2 className="mt-2 font-display text-3xl leading-none">{plot.name}</h2></div><div className="flex gap-2"><span className={`border px-2 py-1 font-mono text-[8px] uppercase tracking-[.1em] ${plot.is_active ? "border-flux/60 text-flux" : "border-steel text-ghost"}`}>{plot.is_active ? "Active" : "Archived"}</span><span className="border border-steel px-2 py-1 font-mono text-[8px] uppercase tracking-[.1em] text-ghost">v{plot.version}</span></div></div>
      <div className="mt-5 grid grid-cols-2 gap-px border border-steel bg-steel"><div className="bg-void/70 p-4"><p className="font-mono text-[8px] uppercase tracking-[.12em] text-ghost">Inputs</p><p className="mt-2 font-display text-3xl text-plasma">{listCount(plot.inputs)}</p></div><div className="bg-void/70 p-4"><p className="font-mono text-[8px] uppercase tracking-[.12em] text-ghost">Positions</p><p className="mt-2 font-display text-3xl text-plasma">{listCount(plot.member_positions)}</p></div></div>
      <p className="mt-4 text-xs leading-5 text-ghost">{plot.stage_layout || "Stage layout notes pending."}</p><p className="mt-2 text-xs leading-5 text-ghost">{plot.power_requirements || "Power requirements pending."}</p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="font-mono text-[9px] uppercase tracking-[.1em] text-ghost">{plot.plot_diagram_url || plot.input_list_pdf_url ? "Technical file linked" : "Technical file pending"}</p><Link className="font-mono text-[9px] uppercase tracking-[.12em] text-flux hover:text-bone" href={`/admin/studios/${plot.artist_id}`}>Open artist studio →</Link></div>
    </article>)}</section> : <BandOpsEmptyState />}
  </BandOpsFrame>;
}
