import Link from "next/link";
import { CalendarDays, CircleAlert, CircleCheck, ListMusic, MapPin, Sparkles, Wrench } from "lucide-react";
import { NoArtistState, PortalEmpty, PortalMetric, PortalPageHeader, PortalSection, PortalStatus, portalDate, portalMoney, portalTime } from "@/components/artist/PortalPrimitives";
import { artistPortalHref, getArtistPortalContext } from "@/lib/artist-portal";

export const dynamic = "force-dynamic";

type Practice = { id: string; title: string; practice_date: string; start_time: string; end_time: string; location: string; focus_type: string | null; status: string };
type Setlist = { id: string; name: string; estimated_duration_minutes: number | null; status: string };
type Gear = { id: string; item_name: string; needs_repair: boolean; estimated_value_cents: number | null };
type Promo = { id: string; title: string; material_type: string; status: string; due_date: string | null };
type Meeting = { id: string; title: string; scheduled_date: string; start_time: string; format: string; location: string | null; status: string };
type RunSheet = { id: string; deal_id: string | null; status: string; set_start_time: string | null; set_duration_minutes: number | null; venue_address: string | null; created_at: string };
type Project = { id: string; title: string; target_release_date: string | null; status: string };
type Session = { id: string; project_id: string; session_date: string; title: string | null; session_status: string; scheduled_start: string | null; engineer_name: string };

const upcoming = (date: string) => date >= new Date().toISOString().slice(0, 10);

export default async function ArtistDashboardPage({ searchParams }: { searchParams: Promise<{ artist?: string }> }) {
  const { artist: preferredArtistId } = await searchParams;
  const { artist, isOperations, supabase } = await getArtistPortalContext(preferredArtistId);
  if (!artist) return <NoArtistState isOperations={isOperations} />;

  const [{ data: practiceData }, { data: setlistData }, { data: gearData }, { data: promoData }, { data: meetingData }, { data: runSheetData }, { data: projectData }] = await Promise.all([
    supabase.from("practices").select("id, title, practice_date, start_time, end_time, location, focus_type, status").eq("artist_id", artist.id).order("practice_date").limit(8).returns<Practice[]>(),
    supabase.from("setlists").select("id, name, estimated_duration_minutes, status").eq("artist_id", artist.id).order("updated_at", { ascending: false }).limit(4).returns<Setlist[]>(),
    supabase.from("gear_inventory").select("id, item_name, needs_repair, estimated_value_cents").eq("artist_id", artist.id).returns<Gear[]>(),
    supabase.from("promo_materials").select("id, title, material_type, status, due_date").eq("artist_id", artist.id).order("due_date").limit(6).returns<Promo[]>(),
    supabase.from("meetings").select("id, title, scheduled_date, start_time, format, location, status").eq("artist_id", artist.id).order("scheduled_date").limit(4).returns<Meeting[]>(),
    supabase.from("show_run_sheets").select("id, deal_id, status, set_start_time, set_duration_minutes, venue_address, created_at").eq("artist_id", artist.id).order("created_at").limit(2).returns<RunSheet[]>(),
    supabase.from("projects").select("id, title, target_release_date, status").eq("artist_id", artist.id).order("target_release_date").limit(3).returns<Project[]>(),
  ]);

  const practices = (practiceData ?? []).filter((practice) => practice.status === "scheduled" && upcoming(practice.practice_date));
  const meetings = (meetingData ?? []).filter((meeting) => meeting.status === "scheduled" && upcoming(meeting.scheduled_date));
  const projects = projectData ?? [];
  const projectIds = projects.map((project) => project.id);
  const { data: sessionData } = projectIds.length
    ? await supabase.from("engineering_sessions").select("id, project_id, session_date, title, session_status, scheduled_start, engineer_name").in("project_id", projectIds).order("session_date").limit(6).returns<Session[]>()
    : { data: [] as Session[] };
  const sessions = (sessionData ?? []).filter((session) => upcoming(session.session_date) && session.session_status !== "cancelled");
  const setlists = setlistData ?? [];
  const gear = gearData ?? [];
  const promo = promoData ?? [];
  const runSheets = runSheetData ?? [];
  const nextPractice = practices[0];
  const nextSession = sessions[0];
  const nextMeeting = meetings[0];
  const nextShow = runSheets[0];
  const repairs = gear.filter((item) => item.needs_repair);
  const gearValue = gear.reduce((total, item) => total + (item.estimated_value_cents ?? 0), 0);
  const readyPromo = promo.filter((item) => item.status === "ready" || item.status === "published");

  return <>
    <PortalPageHeader eyebrow={`øDIN artist field / ${artist.home_market.replaceAll("_", " ")}`} title="Show up ready." copy="Your practices, sessions, show logistics, setlists, gear, and promo—in one signal path." detail={`${artist.status} / ${artist.artist_name}`} />
    <main className="mx-auto max-w-7xl px-5 py-5 sm:px-8 sm:py-7">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><PortalMetric label="Next practice" value={nextPractice ? portalDate(nextPractice.practice_date, { month: "short", day: "numeric" }) : "Clear"} detail={nextPractice ? `${portalTime(nextPractice.start_time)} · ${nextPractice.title}` : "No practice on the field"} /><PortalMetric label="Studio sessions" value={String(sessions.length)} detail={nextSession ? `${portalDate(nextSession.session_date, { month: "short", day: "numeric" })} · ${nextSession.engineer_name}` : "No sessions scheduled"} /><PortalMetric label="Setlists ready" value={String(setlists.filter((setlist) => setlist.status === "finalized").length)} detail={`${setlists.length} setlists tracked`} /><PortalMetric label="Gear watch" value={repairs.length ? `${repairs.length} repair` : "Clear"} detail={repairs.length ? repairs[0].item_name : `${gear.length} items / ${portalMoney(gearValue)}`} /></section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_.85fr]">
        <PortalSection action={{ href: "/artist/schedule", label: "Open schedule" }} detail="shows · practices · sessions · meetings" eyebrow="Your next moves" title="The week in the room.">
          <div className="mt-5 grid gap-2">
            {nextPractice ? <article className="grid gap-3 border border-steel bg-void/45 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center"><div className="border border-flux/50 px-3 py-2 text-center"><p className="font-mono text-[8px] uppercase tracking-[.12em] text-flux">Practice</p><p className="mt-1 font-display text-xl leading-none">{portalDate(nextPractice.practice_date, { month: "short", day: "numeric" })}</p></div><div><p className="text-sm text-bone">{nextPractice.title}</p><p className="mt-1 text-xs text-ghost">{portalTime(nextPractice.start_time)}–{portalTime(nextPractice.end_time)} · {nextPractice.location}</p></div><PortalStatus tone="good">{nextPractice.focus_type?.replaceAll("_", " ") || "Practice"}</PortalStatus></article> : null}
            {nextSession ? <article className="grid gap-3 border border-steel bg-void/45 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center"><div className="border border-blue-400/50 px-3 py-2 text-center"><p className="font-mono text-[8px] uppercase tracking-[.12em] text-blue-300">Studio</p><p className="mt-1 font-display text-xl leading-none">{portalDate(nextSession.session_date, { month: "short", day: "numeric" })}</p></div><div><p className="text-sm text-bone">{nextSession.title || "Studio session"}</p><p className="mt-1 text-xs text-ghost">{nextSession.engineer_name} · {nextSession.scheduled_start ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(nextSession.scheduled_start)) : "Time pending"}</p></div><PortalStatus>{nextSession.session_status.replaceAll("_", " ")}</PortalStatus></article> : null}
            {nextMeeting ? <article className="grid gap-3 border border-steel bg-void/45 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center"><div className="border border-halo/50 px-3 py-2 text-center"><p className="font-mono text-[8px] uppercase tracking-[.12em] text-halo">Meeting</p><p className="mt-1 font-display text-xl leading-none">{portalDate(nextMeeting.scheduled_date, { month: "short", day: "numeric" })}</p></div><div><p className="text-sm text-bone">{nextMeeting.title}</p><p className="mt-1 text-xs text-ghost">{portalTime(nextMeeting.start_time)} · {nextMeeting.location || nextMeeting.format}</p></div><PortalStatus tone="warning">{nextMeeting.format}</PortalStatus></article> : null}
            {!nextPractice && !nextSession && !nextMeeting ? <PortalEmpty>Your calendar is clear. When a practice, session, or meeting is scheduled, it will surface here first.</PortalEmpty> : null}
          </div>
        </PortalSection>
        <PortalSection action={nextShow?.deal_id ? { href: artistPortalHref(`/artist/shows/${nextShow.deal_id}`, artist.id), label: "Open show day" } : undefined} eyebrow="Show day" title="Everything at the door." detail="Run sheets appear when management confirms them">
          {nextShow ? <div className="mt-5"><div className="flex items-start justify-between gap-4"><div><p className="font-display text-3xl leading-none">Show run sheet</p><p className="mt-2 text-xs text-ghost">{nextShow.venue_address || "Venue details in progress"}</p></div><PortalStatus tone={nextShow.status === "confirmed" ? "good" : "default"}>{nextShow.status}</PortalStatus></div><div className="mt-5 grid grid-cols-2 gap-3 border-t border-steel pt-4"><p className="font-mono text-[9px] uppercase tracking-[.1em] text-ghost">Set / <span className="text-bone">{portalTime(nextShow.set_start_time)}</span></p><p className="font-mono text-[9px] uppercase tracking-[.1em] text-ghost">Duration / <span className="text-bone">{nextShow.set_duration_minutes || "—"} min</span></p></div><Link className="mt-5 inline-flex border border-flux px-3 py-2 font-mono text-[9px] uppercase tracking-[.11em] text-flux transition hover:bg-flux hover:text-void" href="/artist/schedule">Open day plan →</Link></div> : <PortalEmpty>When a show is confirmed, its load-in, soundcheck, stage, contact, payment, and promo information will land here.</PortalEmpty>}
        </PortalSection>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-3">
        <PortalSection action={{ href: "/artist/setlists", label: "View setlists" }} eyebrow="Performance" title="Setlist ready.">{setlists.length ? <div className="mt-5 grid gap-2">{setlists.slice(0, 3).map((setlist) => <Link className="group flex items-center justify-between gap-3 border border-steel bg-void/45 p-3 transition hover:border-plasma" href={`/artist/setlists?setlist=${setlist.id}`} key={setlist.id}><div><p className="text-sm text-bone">{setlist.name}</p><p className="mt-1 font-mono text-[8px] uppercase tracking-[.1em] text-ghost">{setlist.estimated_duration_minutes || "—"} min · {setlist.status}</p></div><ListMusic className="h-4 w-4 text-ghost transition group-hover:text-flux" /></Link>)}</div> : <PortalEmpty>Build a setlist once and the practice room and show day will share the same sequence.</PortalEmpty>}</PortalSection>
        <PortalSection action={{ href: "/artist/gear", label: "Open gear" }} eyebrow="Equipment" title="Gear status.">{repairs.length ? <div className="mt-5 border border-red-400/35 bg-red-400/5 p-4"><div className="flex items-center gap-2 text-red-300"><CircleAlert className="h-4 w-4" /><p className="font-mono text-[9px] uppercase tracking-[.11em]">{repairs.length} item needs attention</p></div><p className="mt-3 text-sm text-bone">{repairs[0].item_name}</p></div> : <div className="mt-5 border border-steel bg-void/45 p-4"><div className="flex items-center gap-2 text-flux"><CircleCheck className="h-4 w-4" /><p className="font-mono text-[9px] uppercase tracking-[.11em]">Field clear</p></div><p className="mt-3 text-sm text-bone">{gear.length} items / {portalMoney(gearValue)} covered</p></div>}</PortalSection>
        <PortalSection action={{ href: "/artist/promo", label: "Open promo" }} eyebrow="Promotion" title="Assets in hand.">{promo.length ? <div className="mt-5 grid gap-2">{promo.slice(0, 3).map((material) => <div className="flex items-center justify-between gap-3 border border-steel bg-void/45 p-3" key={material.id}><div><p className="text-sm text-bone">{material.title}</p><p className="mt-1 font-mono text-[8px] uppercase tracking-[.1em] text-ghost">{material.material_type.replaceAll("_", " ")}</p></div><PortalStatus tone={material.status === "ready" || material.status === "published" ? "good" : "default"}>{material.status}</PortalStatus></div>)}</div> : <PortalEmpty>Promo materials will arrive here as they become ready to download and share.</PortalEmpty>}<p className="mt-4 font-mono text-[9px] uppercase tracking-[.1em] text-ghost"><Sparkles className="mr-2 inline h-3 w-3 text-plasma" />{readyPromo.length} ready / {promo.length} tracked</p></PortalSection>
      </section>
    </main>
  </>;
}
