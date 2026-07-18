import { CalendarDays, MapPin } from "lucide-react";
import { EventCoordination } from "@/components/artist/EventCoordination";
import type { BandMember, EventMessage, EventRsvp, EventThreadRecord, EventType } from "@/components/artist/band-types";
import { PracticeQuickAdd } from "@/components/artist/PracticeQuickAdd";
import { NoArtistState, PortalEmpty, PortalPageHeader, PortalStatus, portalDate, portalTime } from "@/components/artist/PortalPrimitives";
import { getArtistPortalContext } from "@/lib/artist-portal";

export const dynamic = "force-dynamic";

type Practice = { id: string; title: string; practice_date: string; start_time: string; end_time: string; location: string; focus_type: string | null; status: string };
type Meeting = { id: string; title: string; scheduled_date: string; start_time: string; end_time: string | null; location: string | null; format: string; status: string };
type RunSheet = { id: string; deal_id: string | null; status: string; created_at: string; load_in_time: string | null; soundcheck_time: string | null; set_start_time: string | null; venue_address: string | null };
type Project = { id: string };
type Session = { id: string; session_date: string; title: string | null; engineer_name: string; scheduled_start: string | null; session_status: string };
type SetlistOption = { id: string; name: string };
type ScheduleEvent = { id: string; eventType: EventType; eventId: string | null; date: string; type: string; tone: "good" | "default" | "warning"; title: string; time: string; place: string; detail: string };

const eventKey = (type: EventType, id: string) => `${type}:${id}`;

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ artist?: string; event?: string; thread?: string }> }) {
  const { artist: preferred, event: focusedEvent, thread: focusedThread } = await searchParams;
  const { artist, isOperations, supabase } = await getArtistPortalContext(preferred);
  if (!artist) return <NoArtistState isOperations={isOperations} />;

  const [{ data: practiceData }, { data: meetingData }, { data: runSheetData }, { data: projectData }, { data: setlistData }, { data: memberData }] = await Promise.all([
    supabase.from("practices").select("id, title, practice_date, start_time, end_time, location, focus_type, status").eq("artist_id", artist.id).order("practice_date").returns<Practice[]>(),
    supabase.from("meetings").select("id, title, scheduled_date, start_time, end_time, location, format, status").eq("artist_id", artist.id).order("scheduled_date").returns<Meeting[]>(),
    supabase.from("show_run_sheets").select("id, deal_id, status, created_at, load_in_time, soundcheck_time, set_start_time, venue_address").eq("artist_id", artist.id).order("created_at").returns<RunSheet[]>(),
    supabase.from("projects").select("id").eq("artist_id", artist.id).returns<Project[]>(),
    supabase.from("setlists").select("id, name").eq("artist_id", artist.id).order("updated_at", { ascending: false }).returns<SetlistOption[]>(),
    supabase.from("band_members").select("id, artist_id, name, role, display_name, avatar_url, avatar_color, is_active, sort_order").eq("artist_id", artist.id).eq("is_active", true).order("sort_order").order("name").returns<BandMember[]>(),
  ]);

  const projectIds = (projectData ?? []).map((project) => project.id);
  const setlists = setlistData ?? [];
  const members = memberData ?? [];
  const { data: sessionData } = projectIds.length ? await supabase.from("engineering_sessions").select("id, session_date, title, engineer_name, scheduled_start, session_status").in("project_id", projectIds).order("session_date").returns<Session[]>() : { data: [] as Session[] };
  const practiceIds = (practiceData ?? []).map((practice) => practice.id);
  const meetingIds = (meetingData ?? []).map((meeting) => meeting.id);
  const sessionIds = (sessionData ?? []).map((session) => session.id);
  const dealIds = (runSheetData ?? []).flatMap((runSheet) => runSheet.deal_id ? [runSheet.deal_id] : []);
  const empty = Promise.resolve({ data: [] as EventRsvp[] });
  const emptyThreads = Promise.resolve({ data: [] as EventThreadRecord[] });
  const [practiceRsvpResponse, meetingRsvpResponse, sessionRsvpResponse, showRsvpResponse, practiceThreadResponse, meetingThreadResponse, sessionThreadResponse, showThreadResponse] = await Promise.all([
    practiceIds.length ? supabase.from("event_rsvps").select("id, event_type, practice_id, deal_id, meeting_id, session_id, band_member_id, response, late_arrival_time, decline_reason, note, responded_at, updated_at").in("practice_id", practiceIds).returns<EventRsvp[]>() : empty,
    meetingIds.length ? supabase.from("event_rsvps").select("id, event_type, practice_id, deal_id, meeting_id, session_id, band_member_id, response, late_arrival_time, decline_reason, note, responded_at, updated_at").in("meeting_id", meetingIds).returns<EventRsvp[]>() : empty,
    sessionIds.length ? supabase.from("event_rsvps").select("id, event_type, practice_id, deal_id, meeting_id, session_id, band_member_id, response, late_arrival_time, decline_reason, note, responded_at, updated_at").in("session_id", sessionIds).returns<EventRsvp[]>() : empty,
    dealIds.length ? supabase.from("event_rsvps").select("id, event_type, practice_id, deal_id, meeting_id, session_id, band_member_id, response, late_arrival_time, decline_reason, note, responded_at, updated_at").in("deal_id", dealIds).returns<EventRsvp[]>() : empty,
    practiceIds.length ? supabase.from("event_threads").select("id, artist_id, event_type, practice_id, deal_id, meeting_id, session_id, title, is_locked").in("practice_id", practiceIds).returns<EventThreadRecord[]>() : emptyThreads,
    meetingIds.length ? supabase.from("event_threads").select("id, artist_id, event_type, practice_id, deal_id, meeting_id, session_id, title, is_locked").in("meeting_id", meetingIds).returns<EventThreadRecord[]>() : emptyThreads,
    sessionIds.length ? supabase.from("event_threads").select("id, artist_id, event_type, practice_id, deal_id, meeting_id, session_id, title, is_locked").in("session_id", sessionIds).returns<EventThreadRecord[]>() : emptyThreads,
    dealIds.length ? supabase.from("event_threads").select("id, artist_id, event_type, practice_id, deal_id, meeting_id, session_id, title, is_locked").in("deal_id", dealIds).returns<EventThreadRecord[]>() : emptyThreads,
  ]);
  const rsvps = [practiceRsvpResponse.data, meetingRsvpResponse.data, sessionRsvpResponse.data, showRsvpResponse.data].flatMap((items) => items ?? []);
  const threads = [practiceThreadResponse.data, meetingThreadResponse.data, sessionThreadResponse.data, showThreadResponse.data].flatMap((items) => items ?? []);
  const threadIds = threads.map((thread) => thread.id);
  const { data: messageData } = threadIds.length ? await supabase.from("event_messages").select("id, thread_id, band_member_id, profile_id, author_name, author_avatar_color, author_role, body, is_system_message, mentions, reactions, deleted_at, created_at").in("thread_id", threadIds).is("deleted_at", null).order("created_at").returns<EventMessage[]>() : { data: [] as EventMessage[] };
  const rsvpsByEvent = new Map<string, EventRsvp[]>();
  for (const rsvp of rsvps) {
    const eventId = rsvp.practice_id || rsvp.deal_id || rsvp.meeting_id || rsvp.session_id;
    if (!eventId) continue;
    const key = eventKey(rsvp.event_type, eventId);
    rsvpsByEvent.set(key, [...(rsvpsByEvent.get(key) ?? []), rsvp]);
  }
  const threadsByEvent = new Map<string, EventThreadRecord>();
  for (const thread of threads) {
    const eventId = thread.practice_id || thread.deal_id || thread.meeting_id || thread.session_id;
    if (eventId && thread.event_type !== "general") threadsByEvent.set(eventKey(thread.event_type, eventId), thread);
  }
  const messagesByThread = new Map<string, EventMessage[]>();
  for (const message of messageData ?? []) messagesByThread.set(message.thread_id, [...(messagesByThread.get(message.thread_id) ?? []), message]);

  const dateToday = new Date().toISOString().slice(0, 10);
  const events: ScheduleEvent[] = [
    ...(practiceData ?? []).filter((item) => item.status === "scheduled").map((item) => ({ id: `practice-${item.id}`, eventType: "practice" as const, eventId: item.id, date: item.practice_date, type: "Practice", tone: "good" as const, title: item.title, time: `${portalTime(item.start_time)}–${portalTime(item.end_time)}`, place: item.location, detail: item.focus_type?.replaceAll("_", " ") || "Band practice" })),
    ...(sessionData ?? []).filter((item) => item.session_status !== "cancelled").map((item) => ({ id: `session-${item.id}`, eventType: "studio_session" as const, eventId: item.id, date: item.session_date, type: "Studio", tone: "default" as const, title: item.title || "Studio session", time: item.scheduled_start ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(item.scheduled_start)) : "Time pending", place: item.engineer_name, detail: item.session_status.replaceAll("_", " ") })),
    ...(meetingData ?? []).filter((item) => item.status === "scheduled").map((item) => ({ id: `meeting-${item.id}`, eventType: "meeting" as const, eventId: item.id, date: item.scheduled_date, type: "Meeting", tone: "warning" as const, title: item.title, time: `${portalTime(item.start_time)}${item.end_time ? `–${portalTime(item.end_time)}` : ""}`, place: item.location || item.format, detail: item.format })),
    ...(runSheetData ?? []).map((item) => ({ id: `show-${item.id}`, eventType: "show" as const, eventId: item.deal_id, date: item.created_at.slice(0, 10), type: "Show", tone: "default" as const, title: "Show run sheet", time: item.set_start_time ? `Set ${portalTime(item.set_start_time)}` : "Timing in progress", place: item.venue_address || "Venue pending", detail: item.status })),
  ].filter((event) => event.date >= dateToday).sort((a, b) => a.date.localeCompare(b.date));

  return <><PortalPageHeader eyebrow="øDIN artist field / shared calendar" title="Everything, one timeline." copy="Shows, practices, sessions, and meetings appear in the order the band needs to live them." detail={`${events.length} upcoming`} /><main className="mx-auto max-w-6xl px-5 py-5 sm:px-8 sm:py-7"><div className="flex items-center gap-3 border border-mercury bg-carbon px-4 py-3 font-mono text-[9px] uppercase tracking-[.12em] text-ghost"><CalendarDays className="h-4 w-4 text-plasma" />List view / named RSVPs / live band coordination</div><section className="mt-4 grid gap-2">{events.length ? events.map((event) => {
    const key = event.eventId ? eventKey(event.eventType, event.eventId) : null;
    const thread = key ? threadsByEvent.get(key) ?? null : null;
    return <article className="border border-mercury bg-carbon p-4" id={event.id} key={event.id}><div className="grid gap-3 sm:grid-cols-[120px_1fr_auto] sm:items-center"><div><p className="font-display text-2xl leading-none">{portalDate(event.date, { month: "short", day: "numeric" })}</p><p className="mt-1 font-mono text-[8px] uppercase tracking-[.1em] text-ghost">{event.time}</p></div><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm text-bone">{event.title}</p><PortalStatus tone={event.tone}>{event.type}</PortalStatus></div><p className="mt-2 flex items-center gap-1 text-xs text-ghost"><MapPin className="h-3 w-3" />{event.place} · {event.detail}</p></div><span className="font-mono text-[8px] uppercase tracking-[.1em] text-ghost">{event.type === "Practice" ? "Band editable" : "Shared context"}</span></div>{members.length && event.eventId ? <EventCoordination event={{ type: event.eventType, id: event.eventId }} initialChatOpen={focusedEvent === key || focusedThread === thread?.id} initialMessages={thread ? messagesByThread.get(thread.id) ?? [] : []} initialRsvps={rsvpsByEvent.get(key ?? "") ?? []} members={members} thread={thread} /> : null}</article>;
  }) : <PortalEmpty>Your shared calendar is clear. Practices, show timing, engineering sessions, and meetings will merge here as they are scheduled.</PortalEmpty>}</section><PracticeQuickAdd artistId={artist.id} setlists={setlists} /></main></>;
}
