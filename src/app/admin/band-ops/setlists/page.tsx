import Link from "next/link";
import { BandOpsEmptyState, BandOpsFrame } from "@/components/admin/BandOpsFrame";
import { getBandOperationsClient } from "@/lib/band-ops-admin";

export const dynamic = "force-dynamic";

type Setlist = { id: string; artist_id: string; name: string; description: string | null; target_duration_minutes: number | null; estimated_duration_minutes: number | null; is_template: boolean; status: string; encore: string[]; transition_notes: string | null; updated_at: string };
type SetlistItem = { id: string; setlist_id: string; position: number; song_title: string; song_key: string | null; tempo_bpm: number | null; duration_seconds: number | null; is_opener: boolean; is_closer: boolean };
type Artist = { id: string; artist_name: string };

export default async function SetlistsPage() {
  const supabase = await getBandOperationsClient("/admin/band-ops/setlists");
  const [{ data: setlistData }, { data: artistData }] = await Promise.all([
    supabase.from("setlists").select("id, artist_id, name, description, target_duration_minutes, estimated_duration_minutes, is_template, status, encore, transition_notes, updated_at").order("updated_at", { ascending: false }).returns<Setlist[]>(),
    supabase.from("artists").select("id, artist_name").returns<Artist[]>(),
  ]);
  const setlists = setlistData ?? [];
  const { data: itemData } = setlists.length ? await supabase.from("setlist_items").select("id, setlist_id, position, song_title, song_key, tempo_bpm, duration_seconds, is_opener, is_closer").in("setlist_id", setlists.map((setlist) => setlist.id)).order("position").returns<SetlistItem[]>() : { data: [] as SetlistItem[] };
  const itemsBySetlist = new Map<string, SetlistItem[]>();
  for (const item of itemData ?? []) itemsBySetlist.set(item.setlist_id, [...(itemsBySetlist.get(item.setlist_id) ?? []), item]);
  const artists = new Map((artistData ?? []).map((artist) => [artist.id, artist.artist_name]));

  return <BandOpsFrame active="/admin/band-ops/setlists" count={setlists.length} countLabel="setlists" description="The living sequence of the show—songs, keys, tempos, handoffs, and the emotional shape of the room." eyebrow="Set architecture" title="The set is a promise to the room.">
    {setlists.length ? <section className="mt-6 grid gap-4 xl:grid-cols-2">{setlists.map((setlist) => {
      const items = itemsBySetlist.get(setlist.id) ?? [];
      return <article className="border border-mercury bg-carbon p-5" key={setlist.id}>
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-[9px] uppercase tracking-[.16em] text-plasma">{artists.get(setlist.artist_id) || "Artist pending"}</p><h2 className="mt-2 font-display text-3xl leading-none">{setlist.name}</h2></div><div className="flex gap-2"><span className="border border-steel px-2 py-1 font-mono text-[8px] uppercase tracking-[.1em] text-ghost">{setlist.status}</span>{setlist.is_template ? <span className="border border-flux/60 px-2 py-1 font-mono text-[8px] uppercase tracking-[.1em] text-flux">Template</span> : null}</div></div>
        <p className="mt-3 min-h-10 text-xs leading-5 text-ghost">{setlist.description || "No show intention recorded yet."}</p>
        <div className="mt-4 flex flex-wrap gap-3 font-mono text-[9px] uppercase tracking-[.1em] text-ghost"><span>{items.length} songs</span><span>{setlist.estimated_duration_minutes || "—"} min est.</span><span>Target {setlist.target_duration_minutes || "—"} min</span></div>
        <ol className="mt-5 divide-y divide-steel border-y border-steel">{items.length ? items.slice(0, 5).map((item) => <li className="flex items-center gap-3 py-2.5" key={item.id}><span className="w-5 font-mono text-[9px] text-plasma">{String(item.position).padStart(2, "0")}</span><span className="min-w-0 flex-1 truncate text-sm">{item.song_title}</span><span className="font-mono text-[9px] text-ghost">{item.song_key || "—"} {item.tempo_bpm ? `· ${item.tempo_bpm}` : ""}</span></li>) : <li className="py-4 text-xs text-ghost">No songs added to this sequence yet.</li>}</ol>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="font-mono text-[9px] uppercase tracking-[.1em] text-ghost">{setlist.encore.length ? `Encore: ${setlist.encore.join(" · ")}` : "Encore unassigned"}</p><Link className="font-mono text-[9px] uppercase tracking-[.12em] text-flux hover:text-bone" href={`/admin/studios/${setlist.artist_id}`}>Open artist studio →</Link></div>
      </article>;
    })}</section> : <BandOpsEmptyState />}
  </BandOpsFrame>;
}
