import Link from "next/link";
import { Music2 } from "lucide-react";
import { SetlistActions } from "@/components/artist/SetlistActions";
import { NoArtistState, PortalEmpty, PortalPageHeader, PortalStatus } from "@/components/artist/PortalPrimitives";
import { getArtistPortalContext } from "@/lib/artist-portal";

export const dynamic = "force-dynamic";
type Setlist = { id: string; name: string; description: string | null; target_duration_minutes: number | null; estimated_duration_minutes: number | null; is_template: boolean; status: string; transition_notes: string | null; encore: string[] };
type Item = { id: string; setlist_id: string; position: number; song_title: string; song_key: string | null; tempo_bpm: number | null; duration_seconds: number | null; notes: string | null; lead_vocalist: string | null; is_opener: boolean; is_closer: boolean; set_break_before: boolean };
const duration = (seconds: number | null) => seconds ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}` : "—";

export default async function SetlistsPage({ searchParams }: { searchParams: Promise<{ artist?: string; setlist?: string }> }) {
  const { artist: preferred, setlist: selectedId } = await searchParams;
  const { artist, isOperations, supabase } = await getArtistPortalContext(preferred);
  if (!artist) return <NoArtistState isOperations={isOperations} />;
  const { data } = await supabase.from("setlists").select("id, name, description, target_duration_minutes, estimated_duration_minutes, is_template, status, transition_notes, encore").eq("artist_id", artist.id).order("updated_at", { ascending: false }).returns<Setlist[]>();
  const setlists = data ?? [];
  const selected = setlists.find((setlist) => setlist.id === selectedId) ?? setlists[0];
  const { data: itemData } = selected ? await supabase.from("setlist_items").select("id, setlist_id, position, song_title, song_key, tempo_bpm, duration_seconds, notes, lead_vocalist, is_opener, is_closer, set_break_before").eq("setlist_id", selected.id).order("position").returns<Item[]>() : { data: [] as Item[] };
  const items = itemData ?? [];
  return <>
    <PortalPageHeader eyebrow="øDIN artist field / performance architecture" title="The set is a system." copy="Keep every sequence, key, transition, and stage note held in the same living record." detail={`${setlists.length} setlists`} />
    <main className="mx-auto grid max-w-7xl gap-4 px-5 py-5 sm:px-8 sm:py-7 xl:grid-cols-[.72fr_1.28fr]">
      <section className="border border-mercury bg-carbon p-5">
        <p className="font-mono text-[9px] uppercase tracking-[.16em] text-plasma">Setlist library</p>
        <SetlistActions artistId={artist.id} nextPosition={1} />
        <div className="mt-3 grid gap-2">
          {setlists.length ? setlists.map((setlist) => <Link className={`border p-4 transition ${selected?.id === setlist.id ? "border-flux bg-flux/10" : "border-steel bg-void/40 hover:border-plasma"}`} href={`/artist/setlists?setlist=${setlist.id}`} key={setlist.id}>
            <div className="flex items-center justify-between gap-3"><p className="text-sm text-bone">{setlist.name}</p><PortalStatus tone={setlist.status === "finalized" ? "good" : "default"}>{setlist.status}</PortalStatus></div>
            <p className="mt-2 font-mono text-[8px] uppercase tracking-[.1em] text-ghost">{setlist.estimated_duration_minutes || "—"} min / {setlist.is_template ? "Template" : "Show set"}</p>
          </Link>) : <PortalEmpty>No setlist exists yet. The first one becomes the shared source for rehearsal and show day.</PortalEmpty>}
        </div>
      </section>
      <section className="border border-mercury bg-carbon p-5 sm:p-6">
        {selected ? <>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-steel pb-5">
            <div><p className="font-mono text-[9px] uppercase tracking-[.16em] text-plasma">Setlist builder / stage order</p><h2 className="mt-3 font-display text-4xl leading-none">{selected.name}</h2><p className="mt-3 text-xs text-ghost">Target {selected.target_duration_minutes || "—"} min · Estimated {selected.estimated_duration_minutes || "—"} min</p></div>
            <div className="flex flex-col items-start gap-1 sm:items-end"><span className="font-mono text-[9px] uppercase tracking-[.1em] text-ghost">Print-ready view</span><SetlistActions artistId={artist.id} nextPosition={items.length + 1} setlistId={selected.id} showNew={false} /></div>
          </div>
          <div className="mt-5 grid gap-2">
            {items.length ? items.map((item) => <article className="grid gap-3 border border-steel bg-void/40 p-4 sm:grid-cols-[40px_1fr_auto]" key={item.id}>
              <p className="font-display text-3xl leading-none text-plasma">{item.position}</p>
              <div><div className="flex flex-wrap items-baseline gap-3"><p className="text-sm text-bone">{item.song_title}</p><span className="font-mono text-[9px] text-flux">{item.song_key || "Key —"}</span><span className="font-mono text-[9px] text-ghost">{duration(item.duration_seconds)}</span></div><div className="mt-2 flex flex-wrap gap-2">{item.is_opener ? <PortalStatus tone="good">Opener</PortalStatus> : null}{item.is_closer ? <PortalStatus tone="warning">Closer</PortalStatus> : null}{item.set_break_before ? <PortalStatus>Set break before</PortalStatus> : null}{item.lead_vocalist ? <PortalStatus>{item.lead_vocalist}</PortalStatus> : null}</div>{item.notes ? <p className="mt-3 text-xs leading-5 text-ghost">{item.notes}</p> : null}</div>
              <p className="font-mono text-[9px] text-ghost">{item.tempo_bpm ? `${item.tempo_bpm} BPM` : ""}</p>
            </article>) : <PortalEmpty>Add songs to turn this into a stage-ready sequence.</PortalEmpty>}
          </div>
          {selected.encore.length ? <div className="mt-5 border-t border-steel pt-4"><p className="font-mono text-[9px] uppercase tracking-[.14em] text-halo">Encore</p><p className="mt-2 text-sm text-bone">{selected.encore.join(" · ")}</p></div> : null}
          {selected.transition_notes ? <div className="mt-4 border border-mercury bg-steel/60 p-4"><p className="font-mono text-[8px] uppercase tracking-[.12em] text-plasma">Transition notes</p><p className="mt-2 text-xs leading-5 text-ghost">{selected.transition_notes}</p></div> : null}
        </> : <PortalEmpty>Choose a setlist to see its stage order.</PortalEmpty>}
      </section>
    </main>
  </>;
}
