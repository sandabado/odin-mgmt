import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Contributor = { id: string; full_name: string; roles: string[]; specialties: string[]; hourly_rate_cents: number | null; active: boolean };
type Session = { id: string; project_id: string; title: string | null; session_date: string; engineer_name: string; session_status: string; hours: number; cost_cents: number; notes: string | null };
type Project = { id: string; title: string; artist_id: string | null };
type Artist = { id: string; artist_name: string };
const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);

export default async function EngineeringPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/engineering");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role === "artist") redirect("/admin");
  const [{ data: contributorData }, { data: sessionData }, { data: projectData }, { data: artistData }] = await Promise.all([
    supabase.from("studio_contributors").select("id, full_name, roles, specialties, hourly_rate_cents, active").order("full_name").returns<Contributor[]>(),
    supabase.from("engineering_sessions").select("id, project_id, title, session_date, engineer_name, session_status, hours, cost_cents, notes").order("session_date", { ascending: false }).returns<Session[]>(),
    supabase.from("projects").select("id, title, artist_id").returns<Project[]>(),
    supabase.from("artists").select("id, artist_name").returns<Artist[]>(),
  ]);
  const projects = new Map((projectData ?? []).map((project) => [project.id, project]));
  const artists = new Map((artistData ?? []).map((artist) => [artist.id, artist.artist_name]));
  const contributors = contributorData ?? [];
  const sessions = sessionData ?? [];

  return <main className="min-h-screen bg-void px-5 py-8 text-bone sm:px-8"><div className="mx-auto max-w-7xl"><header className="flex flex-wrap items-end justify-between gap-5 border-b border-mercury pb-6"><div><Link className="font-mono text-[10px] uppercase tracking-[.16em] text-ghost hover:text-flux" href="/admin">← Command hub</Link><p className="mt-5 font-mono text-[10px] uppercase tracking-[.18em] text-plasma">Whole Body Studios / engineering field</p><h1 className="mt-3 font-display text-5xl leading-none">The room remembers.</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-ghost">Sessions, creative direction, decisions, and delivery—held on the work itself.</p></div><div className="border border-flux px-4 py-3 font-mono text-[10px] uppercase tracking-[.12em] text-flux">{sessions.length} sessions / {contributors.length} contributors</div></header><section className="mt-6 grid gap-4 lg:grid-cols-[.8fr_1.2fr]"><article className="border border-mercury bg-carbon p-5"><p className="font-mono text-[9px] uppercase tracking-[.16em] text-plasma">Engineers & producers</p><h2 className="mt-3 font-display text-3xl leading-none">The people in the room.</h2>{contributors.length ? <div className="mt-5 grid gap-2">{contributors.map((person) => <article className="border border-steel bg-void/60 p-4" key={person.id}><div className="flex items-center justify-between gap-3"><p className="text-sm">{person.full_name}</p><span className={`h-2 w-2 rounded-full ${person.active ? "bg-flux" : "bg-ghost"}`} /></div><p className="mt-2 font-mono text-[9px] uppercase tracking-[.1em] text-ghost">{person.roles.join(" · ") || "Role pending"}</p><p className="mt-2 text-xs text-ghost">{person.specialties.join(" · ") || "Specialties pending"}</p>{person.hourly_rate_cents ? <p className="mt-3 font-mono text-[9px] text-flux">{money(person.hourly_rate_cents)} / hr</p> : null}</article>)}</div> : <p className="mt-5 border border-dashed border-steel p-4 text-xs leading-5 text-ghost">Add the first engineer or producer to begin staffing projects. Their assignments and session context will live here.</p>}</article><article className="border border-mercury bg-carbon p-5"><p className="font-mono text-[9px] uppercase tracking-[.16em] text-plasma">Session ledger</p><h2 className="mt-3 font-display text-3xl leading-none">Every decision, attached to the take.</h2>{sessions.length ? <div className="mt-5 grid gap-2">{sessions.map((session) => { const project = projects.get(session.project_id); return <Link className="group grid gap-3 border border-steel bg-void/60 p-4 transition hover:border-plasma sm:grid-cols-[1fr_auto] sm:items-center" href={`/admin/engineering/sessions/${session.id}`} key={session.id}><div><p className="text-sm">{session.title || `${project?.title || "Project"} / session`}</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[.1em] text-ghost">{project?.title || "Project pending"} · {project?.artist_id ? artists.get(project.artist_id) : "Artist pending"} · {session.session_date}</p><p className="mt-2 text-xs text-ghost">{session.notes || "No session note yet."}</p></div><div className="text-right"><p className="font-mono text-[9px] uppercase tracking-[.1em] text-flux">{session.session_status}</p><p className="mt-2 font-mono text-[9px] text-ghost">{session.hours}h · {money(session.cost_cents)}</p><p className="mt-3 font-mono text-[9px] uppercase tracking-[.1em] text-flux opacity-0 transition group-hover:opacity-100">Open notes →</p></div></Link>; })}</div> : <p className="mt-5 border border-dashed border-steel p-4 text-xs leading-5 text-ghost">No sessions yet. Once a session is scheduled, its notes, reference tracks, and response history will stay here.</p>}</article></section></div></main>;
}
