import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CircleAlert, Guitar, Image, ListMusic, MapPin, Phone } from "lucide-react";
import {
  NoArtistState,
  PortalEmpty,
  PortalPageHeader,
  PortalSection,
  PortalStatus,
  portalTime,
} from "@/components/artist/PortalPrimitives";
import { artistPortalHref, getArtistPortalContext } from "@/lib/artist-portal";

export const dynamic = "force-dynamic";

type RunSheet = {
  id: string;
  deal_id: string | null;
  venue_address: string | null;
  venue_phone: string | null;
  parking_instructions: string | null;
  load_in_time: string | null;
  soundcheck_time: string | null;
  doors_open_time: string | null;
  set_start_time: string | null;
  set_duration_minutes: number | null;
  set_end_time: string | null;
  curfew_time: string | null;
  backline_provided: string[];
  band_brings: string[];
  stage_dimensions: string | null;
  payment_method: string | null;
  payment_contact: string | null;
  event_bandsintown_url: string | null;
  venue_instagram: string | null;
  hashtag: string[];
  promo_assets_ready: boolean;
  venue_day_of_contact: string | null;
  venue_day_of_phone: string | null;
  manager_day_of_contact: string | null;
  load_out_instructions: string | null;
  settlement_notes: string | null;
  status: string;
};

type Setlist = {
  id: string;
  name: string;
  estimated_duration_minutes: number | null;
  status: string;
  transition_notes: string | null;
};

type SetlistItem = {
  id: string;
  position: number;
  song_title: string;
  song_key: string | null;
  duration_seconds: number | null;
  is_opener: boolean;
  is_closer: boolean;
};

type StagePlot = {
  name: string;
  stage_layout: string | null;
  member_positions: unknown;
  power_requirements: string | null;
};

type Gear = {
  id: string;
  item_name: string;
  needs_repair: boolean;
  repair_notes: string | null;
};

type Promo = {
  id: string;
  title: string;
  material_type: string;
  status: string;
  due_date: string | null;
};

const clean = (value: string) => value.replaceAll("_", " ");
const duration = (seconds: number | null) => seconds ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}` : "—";
const statusTone = (status: string): "default" | "good" | "warning" | "danger" => {
  if (["confirmed", "completed", "finalized"].includes(status)) return "good";
  if (["draft", "day_of"].includes(status)) return "warning";
  if (status === "cancelled") return "danger";
  return "default";
};

function stageMembers(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((member) => {
    if (typeof member === "string") return [member];
    if (!member || typeof member !== "object") return [];
    const record = member as Record<string, unknown>;
    const name = typeof record.name === "string" ? record.name : null;
    const position = typeof record.position === "string" ? record.position : null;
    const instrument = typeof record.instrument === "string" ? record.instrument : null;
    return [name, position, instrument].filter(Boolean).join(" · ") ? [[name, position, instrument].filter(Boolean).join(" · ")] : [];
  });
}

export default async function ArtistShowDayPage({
  params,
  searchParams,
}: {
  params: Promise<{ dealId: string }>;
  searchParams: Promise<{ artist?: string }>;
}) {
  const [{ dealId }, { artist: preferredArtistId }] = await Promise.all([params, searchParams]);
  const { artist, isOperations, supabase } = await getArtistPortalContext(preferredArtistId);

  if (!artist) return <NoArtistState isOperations={isOperations} />;

  const { data: runSheet } = await supabase
    .from("show_run_sheets")
    .select("id, deal_id, venue_address, venue_phone, parking_instructions, load_in_time, soundcheck_time, doors_open_time, set_start_time, set_duration_minutes, set_end_time, curfew_time, backline_provided, band_brings, stage_dimensions, payment_method, payment_contact, event_bandsintown_url, venue_instagram, hashtag, promo_assets_ready, venue_day_of_contact, venue_day_of_phone, manager_day_of_contact, load_out_instructions, settlement_notes, status")
    .eq("artist_id", artist.id)
    .eq("deal_id", dealId)
    .maybeSingle<RunSheet>();

  if (!runSheet) notFound();

  const [{ data: setlistData }, { data: stagePlotData }, { data: gearData }, { data: promoData }] = await Promise.all([
    supabase
      .from("setlists")
      .select("id, name, estimated_duration_minutes, status, transition_notes")
      .eq("artist_id", artist.id)
      .eq("deal_id", dealId)
      .maybeSingle<Setlist>(),
    supabase
      .from("stage_plots")
      .select("name, stage_layout, member_positions, power_requirements")
      .eq("artist_id", artist.id)
      .order("is_active", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(1)
      .returns<StagePlot[]>(),
    supabase
      .from("gear_inventory")
      .select("id, item_name, needs_repair, repair_notes")
      .eq("artist_id", artist.id)
      .order("needs_repair", { ascending: false })
      .order("item_name")
      .returns<Gear[]>(),
    supabase
      .from("promo_materials")
      .select("id, title, material_type, status, due_date")
      .eq("artist_id", artist.id)
      .eq("deal_id", dealId)
      .order("due_date")
      .returns<Promo[]>(),
  ]);

  const setlist = setlistData ?? null;
  const { data: setlistItemData } = setlist
    ? await supabase
      .from("setlist_items")
      .select("id, position, song_title, song_key, duration_seconds, is_opener, is_closer")
      .eq("setlist_id", setlist.id)
      .order("position")
      .returns<SetlistItem[]>()
    : { data: [] as SetlistItem[] };

  const stagePlot = stagePlotData?.[0] ?? null;
  const gear = gearData ?? [];
  const repairs = gear.filter((item) => item.needs_repair);
  const promo = promoData ?? [];
  const scheduleHref = artistPortalHref("/artist/schedule", artist.id);
  const setlistHref = artistPortalHref(setlist ? `/artist/setlists?setlist=${setlist.id}` : "/artist/setlists", artist.id);
  const timeline = [
    ["Load-in", runSheet.load_in_time, runSheet.parking_instructions || "Arrival details pending."],
    ["Soundcheck", runSheet.soundcheck_time, "Confirm the room, monitor mix, and stage changeover."],
    ["Doors", runSheet.doors_open_time, "Merch, guest list, and room positions live."],
    ["Set", runSheet.set_start_time, `${runSheet.set_duration_minutes || "—"} minute performance window.`],
    ["Set end", runSheet.set_end_time, runSheet.curfew_time ? `Curfew ${portalTime(runSheet.curfew_time)}.` : "Curfew pending."],
    ["Load-out", null, runSheet.load_out_instructions || "Load-out instructions pending."],
  ] as const;

  return <>
    <PortalPageHeader
      eyebrow="øDIN artist field / show day"
      title="Move with the room."
      copy={runSheet.venue_address || "Venue details are being confirmed."}
      detail={clean(runSheet.status)}
    >
      <Link className="border border-mercury px-3 py-2 font-mono text-[9px] uppercase tracking-[.11em] text-ghost transition hover:border-flux hover:text-flux" href={scheduleHref}>← Schedule</Link>
    </PortalPageHeader>

    <main className="mx-auto max-w-7xl px-5 py-5 sm:px-8 sm:py-7">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="border border-steel bg-void/40 p-4"><p className="font-mono text-[9px] uppercase tracking-[.12em] text-ghost">Show status</p><div className="mt-3"><PortalStatus tone={statusTone(runSheet.status)}>{clean(runSheet.status)}</PortalStatus></div></article>
        <article className="border border-steel bg-void/40 p-4"><p className="font-mono text-[9px] uppercase tracking-[.12em] text-ghost">Load-in</p><p className="mt-3 font-display text-3xl leading-none">{portalTime(runSheet.load_in_time)}</p><p className="mt-2 text-xs text-ghost">Arrival &amp; stage access</p></article>
        <article className="border border-steel bg-void/40 p-4"><p className="font-mono text-[9px] uppercase tracking-[.12em] text-ghost">Set time</p><p className="mt-3 font-display text-3xl leading-none">{portalTime(runSheet.set_start_time)}</p><p className="mt-2 text-xs text-ghost">{runSheet.set_duration_minutes || "—"} minutes on stage</p></article>
        <article className="border border-steel bg-void/40 p-4"><p className="font-mono text-[9px] uppercase tracking-[.12em] text-ghost">Field readiness</p><p className="mt-3 font-display text-3xl leading-none">{runSheet.promo_assets_ready ? "Assets live" : "In build"}</p><p className="mt-2 text-xs text-ghost">{repairs.length ? `${repairs.length} gear flags` : "Gear watch clear"}</p></article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <PortalSection eyebrow="Run sheet" title="The day, in order." detail="Load-in → set → load-out">
          <div className="mt-5 border-l border-flux/45">
            {timeline.map(([label, time, note], index) => <article className="relative grid gap-3 border-b border-r border-steel bg-void/35 p-4 sm:grid-cols-[132px_1fr]" key={label}><span className={`absolute -left-[5px] top-5 h-2 w-2 rounded-full ${time ? "bg-flux shadow-[0_0_13px_rgba(0,255,194,.85)]" : "bg-mercury"}`} /><div><p className="font-mono text-[8px] uppercase tracking-[.13em] text-ghost">{String(index + 1).padStart(2, "0")} / {label}</p><p className="mt-2 font-display text-2xl leading-none">{portalTime(time)}</p></div><p className="text-xs leading-5 text-ghost">{note}</p></article>)}
          </div>
        </PortalSection>

        <PortalSection eyebrow="Contacts & arrival" title="Know who to call." detail="Show-facing details only">
          <div className="mt-5 grid gap-2">
            <article className="border border-steel bg-void/40 p-4"><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-plasma" /><p className="font-mono text-[9px] uppercase tracking-[.12em] text-ghost">Venue</p></div><p className="mt-3 text-sm text-bone">{runSheet.venue_address || "Venue address pending"}</p>{runSheet.venue_phone ? <a className="mt-3 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.1em] text-flux" href={`tel:${runSheet.venue_phone}`}><Phone className="h-3 w-3" />{runSheet.venue_phone}</a> : null}</article>
            <article className="border border-steel bg-void/40 p-4"><p className="font-mono text-[9px] uppercase tracking-[.12em] text-ghost">Day-of contact</p><p className="mt-3 text-sm text-bone">{runSheet.venue_day_of_contact || "Not confirmed yet"}</p>{runSheet.venue_day_of_phone ? <a className="mt-3 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.1em] text-flux" href={`tel:${runSheet.venue_day_of_phone}`}><Phone className="h-3 w-3" />{runSheet.venue_day_of_phone}</a> : <p className="mt-2 text-xs text-ghost">Management will add the day-of line.</p>}</article>
            <article className="border border-steel bg-void/40 p-4"><p className="font-mono text-[9px] uppercase tracking-[.12em] text-ghost">Management lead</p><p className="mt-3 text-sm text-bone">{runSheet.manager_day_of_contact || "Assigned through management"}</p></article>
          </div>
        </PortalSection>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-2">
        <PortalSection action={{ href: setlistHref, label: setlist ? "Open full setlist" : "Open setlists" }} eyebrow="Performance" title="The sequence on stage." detail={setlist ? `${setlist.estimated_duration_minutes || "—"} min / ${clean(setlist.status)}` : "Setlist not linked"}>
          {setlist ? <div className="mt-5"><div className="flex items-start justify-between gap-4"><div><p className="font-display text-3xl leading-none">{setlist.name}</p><p className="mt-3 text-xs leading-5 text-ghost">{setlist.transition_notes || "Transitions will be confirmed in rehearsal."}</p></div><ListMusic className="h-5 w-5 text-plasma" /></div><ol className="mt-5 grid gap-2">{(setlistItemData ?? []).map((item) => <li className="grid grid-cols-[30px_1fr_auto] gap-3 border border-steel bg-void/40 p-3" key={item.id}><p className="font-display text-2xl leading-none text-plasma">{item.position}</p><div><p className="text-sm text-bone">{item.song_title} {item.song_key ? <span className="font-mono text-[9px] text-flux">/ {item.song_key}</span> : null}</p><div className="mt-2 flex gap-2">{item.is_opener ? <PortalStatus tone="good">Opener</PortalStatus> : null}{item.is_closer ? <PortalStatus tone="warning">Closer</PortalStatus> : null}</div></div><p className="font-mono text-[9px] text-ghost">{duration(item.duration_seconds)}</p></li>)}</ol></div> : <PortalEmpty>Management can attach the final running order when it is ready.</PortalEmpty>}
        </PortalSection>

        <PortalSection eyebrow="Stage & gear" title="Nothing left in the van." detail={`${gear.length} logged items`}>
          <div className="mt-5 grid gap-3">
            <article className="border border-steel bg-void/40 p-4"><div className="flex items-center gap-2"><Guitar className="h-4 w-4 text-plasma" /><p className="font-mono text-[9px] uppercase tracking-[.12em] text-ghost">Backline / band bring</p></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><div><p className="font-mono text-[8px] uppercase tracking-[.11em] text-flux">Provided</p><p className="mt-2 text-xs text-ghost">{runSheet.backline_provided.join(" · ") || "No backline confirmed."}</p></div><div><p className="font-mono text-[8px] uppercase tracking-[.11em] text-halo">Band brings</p><p className="mt-2 text-xs text-ghost">{runSheet.band_brings.join(" · ") || "Band load list pending."}</p></div></div></article>
            <article className="border border-steel bg-void/40 p-4"><p className="font-mono text-[9px] uppercase tracking-[.12em] text-ghost">Stage plot / {stagePlot?.name || "Not assigned"}</p><p className="mt-3 text-sm text-bone">{stagePlot?.stage_layout || runSheet.stage_dimensions || "Stage layout pending."}</p><p className="mt-2 text-xs text-ghost">{stagePlot?.power_requirements || "Power confirmation pending."}</p><div className="mt-3 flex flex-wrap gap-2">{stageMembers(stagePlot?.member_positions).slice(0, 4).map((member) => <span className="border border-mercury px-2 py-1 font-mono text-[8px] uppercase tracking-[.09em] text-ghost" key={member}>{member}</span>)}</div></article>
            {repairs.length ? <article className="border border-red-400/40 bg-red-400/5 p-4"><div className="flex gap-2 text-red-300"><CircleAlert className="h-4 w-4" /><p className="font-mono text-[9px] uppercase tracking-[.12em]">Gear watch</p></div><p className="mt-3 text-sm text-bone">{repairs.map((item) => item.item_name).join(" · ")}</p><p className="mt-2 text-xs text-red-200">{repairs.map((item) => item.repair_notes).filter(Boolean).join(" · ")}</p></article> : null}
          </div>
        </PortalSection>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[.85fr_1.15fr]">
        <PortalSection eyebrow="Settlement" title="The terms you need." detail="Artist-facing scope">
          <div className="mt-5 border border-steel bg-void/40 p-4"><p className="font-mono text-[9px] uppercase tracking-[.12em] text-ghost">Day-of settlement</p><p className="mt-3 text-sm text-bone">{runSheet.settlement_notes || "Settlement details will appear here when confirmed."}</p><p className="mt-2 text-xs text-ghost">{runSheet.payment_method ? `Method / ${runSheet.payment_method}` : "Method pending"}{runSheet.payment_contact ? ` · Contact / ${runSheet.payment_contact}` : ""}</p></div>
        </PortalSection>

        <PortalSection eyebrow="Promotion" title="Make the room find the show." detail={runSheet.promo_assets_ready ? "Assets marked ready" : "Assets in build"}>
          {promo.length ? <div className="mt-5 grid gap-2 sm:grid-cols-2">{promo.map((item) => <article className="border border-steel bg-void/40 p-4" key={item.id}><Image className="h-4 w-4 text-plasma" /><p className="mt-5 text-sm text-bone">{item.title}</p><p className="mt-2 font-mono text-[8px] uppercase tracking-[.1em] text-ghost">{clean(item.material_type)} · {clean(item.status)}</p></article>)}</div> : <PortalEmpty>Show-specific promo appears here when it is attached to this date.</PortalEmpty>}
          {runSheet.hashtag.length ? <p className="mt-4 font-mono text-[9px] uppercase tracking-[.1em] text-flux">{runSheet.hashtag.join(" ")}</p> : null}
        </PortalSection>
      </section>

      <section className="mt-4 border border-mercury bg-carbon p-5 sm:flex sm:items-center sm:justify-between sm:gap-6"><div className="flex gap-3"><CalendarDays className="mt-0.5 h-5 w-5 text-plasma" /><div><p className="font-display text-2xl leading-none">One source for show day.</p><p className="mt-2 text-xs text-ghost">Missing information stays visibly pending instead of hiding in an operations thread.</p></div></div><Link className="mt-4 inline-flex border border-flux px-4 py-3 font-mono text-[9px] uppercase tracking-[.12em] text-flux transition hover:bg-flux hover:text-void sm:mt-0" href={scheduleHref}>Back to schedule →</Link></section>
    </main>
  </>;
}
