import Link from "next/link";
import { BandOpsEmptyState, BandOpsFrame } from "@/components/admin/BandOpsFrame";
import { getBandOperationsClient } from "@/lib/band-ops-admin";

export const dynamic = "force-dynamic";

type Meeting = { id: string; title: string; meeting_type: string; scheduled_date: string; start_time: string; end_time: string | null; format: string; location: string | null; meeting_url: string | null; agenda: string[]; action_items: string[]; status: string; artist_id: string | null; project_id: string | null };
type Artist = { id: string; artist_name: string };
type Project = { id: string; title: string };

const displayDate = (value: string) => new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(`${value}T00:00:00`));
const displayTime = (value: string | null) => value ? value.slice(0, 5) : "TBD";

export default async function MeetingsPage() {
  const supabase = await getBandOperationsClient("/admin/band-ops/meetings");
  const [{ data: meetingData }, { data: artistData }, { data: projectData }] = await Promise.all([
    supabase.from("meetings").select("id, title, meeting_type, scheduled_date, start_time, end_time, format, location, meeting_url, agenda, action_items, status, artist_id, project_id").order("scheduled_date").order("start_time").returns<Meeting[]>(),
    supabase.from("artists").select("id, artist_name").returns<Artist[]>(),
    supabase.from("projects").select("id, title").returns<Project[]>(),
  ]);
  const meetings = meetingData ?? [];
  const artists = new Map((artistData ?? []).map((artist) => [artist.id, artist.artist_name]));
  const projects = new Map((projectData ?? []).map((project) => [project.id, project.title]));

  return <BandOpsFrame active="/admin/band-ops/meetings" count={meetings.length} countLabel="meetings" description="Every decision has a room, a time, and an owner. Capture the conversation before it becomes a loose thread." eyebrow="Shared decisions" title="The band stays in the same conversation.">
    {meetings.length ? <section className="mt-6 grid gap-3">{meetings.map((meeting) => <article className="grid gap-4 border border-mercury bg-carbon p-5 lg:grid-cols-[auto_1fr_auto] lg:items-start" key={meeting.id}>
      <div className="min-w-28 border border-steel bg-void/70 p-3 text-center"><p className="font-mono text-[8px] uppercase tracking-[.12em] text-ghost">{displayDate(meeting.scheduled_date)}</p><p className="mt-2 font-display text-2xl text-plasma">{displayTime(meeting.start_time)}</p><p className="mt-1 font-mono text-[8px] uppercase tracking-[.1em] text-ghost">{meeting.format.replaceAll("_", " ")}</p></div>
      <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-3xl leading-none">{meeting.title}</h2><span className="border border-steel px-2 py-1 font-mono text-[8px] uppercase tracking-[.1em] text-ghost">{meeting.status}</span></div><p className="mt-2 font-mono text-[9px] uppercase tracking-[.1em] text-plasma">{meeting.meeting_type.replaceAll("_", " ")}</p><p className="mt-3 text-sm text-ghost">{meeting.location || (meeting.meeting_url ? "Remote room linked" : "Location pending")} · {meeting.artist_id ? artists.get(meeting.artist_id) || "Artist pending" : projects.get(meeting.project_id || "") || "Shared operations"}</p>{meeting.agenda.length ? <p className="mt-3 text-xs leading-5 text-ghost">Agenda: {meeting.agenda.join(" · ")}</p> : null}</div>
      <div className="flex flex-col items-start gap-3 lg:items-end"><p className="font-mono text-[9px] uppercase tracking-[.1em] text-ghost">{meeting.action_items.length} action items</p>{meeting.artist_id ? <Link className="font-mono text-[9px] uppercase tracking-[.12em] text-flux hover:text-bone" href={`/admin/studios/${meeting.artist_id}`}>Open artist studio →</Link> : <Link className="font-mono text-[9px] uppercase tracking-[.12em] text-flux hover:text-bone" href="/admin/artists">Open artists →</Link>}</div>
    </article>)}</section> : <BandOpsEmptyState />}
  </BandOpsFrame>;
}
