import { CalendarDays, MapPin } from "lucide-react";
import { PracticeQuickAdd } from "@/components/artist/PracticeQuickAdd";
import { NoArtistState, PortalEmpty, PortalPageHeader, PortalStatus, portalDate, portalTime } from "@/components/artist/PortalPrimitives";
import { getArtistPortalContext } from "@/lib/artist-portal";

export const dynamic = "force-dynamic";
type Practice = { id: string; title: string; practice_date: string; start_time: string; end_time: string; location: string; focus_type: string | null; status: string };
type Meeting = { id: string; title: string; scheduled_date: string; start_time: string; end_time: string | null; location: string | null; format: string; status: string };
type RunSheet = { id: string; status: string; created_at: string; load_in_time: string | null; soundcheck_time: string | null; set_start_time: string | null; venue_address: string | null };
type Project = { id: string };
type Session = { id: string; session_date: string; title: string | null; engineer_name: string; scheduled_start: string | null; session_status: string };
type SetlistOption = { id: string; name: string };

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ artist?: string }> }) {
  const { artist: preferred } = await searchParams;
  const { artist, isOperations, supabase } = await getArtistPortalContext(preferred);
  if (!artist) return <NoArtistState isOperations={isOperations} />;
  const [{ data: practiceData }, { data: meetingData }, { data: runSheetData }, { data: projectData }, { data: setlistData }] = await Promise.all([
    supabase.from("practices").select("id, title, practice_date, start_time, end_time, location, focus_type, status").eq("artist_id", artist.id).order("practice_date").returns<Practice[]>(),
    supabase.from("meetings").select("id, title, scheduled_date, start_time, end_time, location, format, status").eq("artist_id", artist.id).order("scheduled_date").returns<Meeting[]>(),
    supabase.from("show_run_sheets").select("id, status, created_at, load_in_time, soundcheck_time, set_start_time, venue_address").eq("artist_id", artist.id).order("created_at").returns<RunSheet[]>(),
    supabase.from("projects").select("id").eq("artist_id", artist.id).returns<Project[]>(),
    supabase.from("setlists").select("id, name").eq("artist_id", artist.id).order("updated_at", { ascending: false }).returns<SetlistOption[]>(),
  ]);
  const projectIds = (projectData ?? []).map((project) => project.id);
  const setlists = setlistData ?? [];
  const { data: sessionData } = projectIds.length ? await supabase.from("engineering_sessions").select("id, session_date, title, engineer_name, scheduled_start, session_status").in("project_id", projectIds).order("session_date").returns<Session[]>() : { data: [] as Session[] };
  const dateToday = new Date().toISOString().slice(0, 10);
  const events = [
    ...(practiceData ?? []).filter((item) => item.status === "scheduled").map((item) => ({ id: `practice-${item.id}`, date: item.practice_date, type: "Practice", tone: "good" as const, title: item.title, time: `${portalTime(item.start_time)}–${portalTime(item.end_time)}`, place: item.location, detail: item.focus_type?.replaceAll("_", " ") || "Band practice" })),
    ...(sessionData ?? []).filter((item) => item.session_status !== "cancelled").map((item) => ({ id: `session-${item.id}`, date: item.session_date, type: "Studio", tone: "default" as const, title: item.title || "Studio session", time: item.scheduled_start ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(item.scheduled_start)) : "Time pending", place: item.engineer_name, detail: item.session_status.replaceAll("_", " ") })),
    ...(meetingData ?? []).filter((item) => item.status === "scheduled").map((item) => ({ id: `meeting-${item.id}`, date: item.scheduled_date, type: "Meeting", tone: "warning" as const, title: item.title, time: `${portalTime(item.start_time)}${item.end_time ? `–${portalTime(item.end_time)}` : ""}`, place: item.location || item.format, detail: item.format })),
    ...(runSheetData ?? []).map((item) => ({ id: `show-${item.id}`, date: item.created_at.slice(0, 10), type: "Show", tone: "default" as const, title: "Show run sheet", time: item.set_start_time ? `Set ${portalTime(item.set_start_time)}` : "Timing in progress", place: item.venue_address || "Venue pending", detail: item.status })),
  ].filter((event) => event.date >= dateToday).sort((a, b) => a.date.localeCompare(b.date));
  return <><PortalPageHeader eyebrow="øDIN artist field / shared calendar" title="Everything, one timeline." copy="Shows, practices, sessions, and meetings appear in the order the band needs to live them." detail={`${events.length} upcoming`} /><main className="mx-auto max-w-6xl px-5 py-5 sm:px-8 sm:py-7"><div className="flex items-center gap-3 border border-mercury bg-carbon px-4 py-3 font-mono text-[9px] uppercase tracking-[.12em] text-ghost"><CalendarDays className="h-4 w-4 text-plasma" />List view / upcoming 30+ days / synced operating field</div><section className="mt-4 grid gap-2">{events.length ? events.map((event) => <article className="grid gap-3 border border-mercury bg-carbon p-4 sm:grid-cols-[120px_1fr_auto] sm:items-center" key={event.id}><div><p className="font-display text-2xl leading-none">{portalDate(event.date, { month: "short", day: "numeric" })}</p><p className="mt-1 font-mono text-[8px] uppercase tracking-[.1em] text-ghost">{event.time}</p></div><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm text-bone">{event.title}</p><PortalStatus tone={event.tone}>{event.type}</PortalStatus></div><p className="mt-2 flex items-center gap-1 text-xs text-ghost"><MapPin className="h-3 w-3" />{event.place} · {event.detail}</p></div><span className="font-mono text-[8px] uppercase tracking-[.1em] text-ghost">{event.type === "Practice" ? "Band editable" : "Shared context"}</span></article>) : <PortalEmpty>Your shared calendar is clear. Practices, show timing, engineering sessions, and meetings will merge here as they are scheduled.</PortalEmpty>}</section><PracticeQuickAdd artistId={artist.id} setlists={setlists} /></main></>;
}
