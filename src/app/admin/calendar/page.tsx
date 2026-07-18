import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
type Dated = { id: string; date: string | null; title: string; detail: string; tone: string };
const label = (date: string | null) => date ? new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(`${date}T00:00:00`)) : "Date pending";

export default async function CalendarPage() {
  const supabase = await createSupabaseServerClient(); const today = new Date().toISOString().slice(0, 10);
  const [{ data: deals }, { data: meetings }, { data: practices }, { data: projects }] = await Promise.all([
    supabase.from("deals").select("id,event_date,deal_type,stage").gte("event_date", today).order("event_date").limit(12),
    supabase.from("meetings").select("id,scheduled_date,title,format,location,status").gte("scheduled_date", today).order("scheduled_date").limit(12),
    supabase.from("practices").select("id,practice_date,title,location,status").gte("practice_date", today).order("practice_date").limit(12),
    supabase.from("projects").select("id,title,target_release_date,status").gte("target_release_date", today).order("target_release_date").limit(12),
  ]);
  const entries: Dated[] = [
    ...(deals ?? []).map((item) => ({ id: `deal-${item.id}`, date: item.event_date, title: `Show · ${item.deal_type.replaceAll("_", " ")}`, detail: item.stage, tone: "text-flux" })),
    ...(meetings ?? []).filter((item) => item.status !== "cancelled").map((item) => ({ id: `meeting-${item.id}`, date: item.scheduled_date, title: `Meeting · ${item.title}`, detail: item.location || item.format, tone: "text-halo" })),
    ...(practices ?? []).filter((item) => item.status !== "cancelled").map((item) => ({ id: `practice-${item.id}`, date: item.practice_date, title: `Practice · ${item.title}`, detail: item.location, tone: "text-plasma" })),
    ...(projects ?? []).map((item) => ({ id: `project-${item.id}`, date: item.target_release_date, title: `Release target · ${item.title}`, detail: item.status, tone: "text-ghost" })),
  ].sort((left, right) => (left.date || "9999").localeCompare(right.date || "9999")).slice(0, 24);
  return <main className="min-h-screen bg-void px-5 py-8 text-bone sm:px-8"><div className="mx-auto max-w-5xl"><header className="flex flex-wrap items-end justify-between gap-4 border-b border-mercury pb-6"><div><Link className="font-mono text-[10px] uppercase tracking-[.16em] text-ghost hover:text-flux" href="/admin/dashboard">← Dashboard</Link><p className="mt-5 font-mono text-[10px] uppercase tracking-[.18em] text-plasma">Operations calendar</p><h1 className="mt-3 font-display text-5xl leading-none">Everything, in time.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-ghost">Shows, meetings, practices, and release targets in the order the team needs to live them.</p></div><CalendarDays className="h-8 w-8 text-flux" /></header><section className="mt-5 border border-mercury bg-carbon">{entries.length ? entries.map((entry) => <article className="grid grid-cols-[108px_minmax(0,1fr)] gap-4 border-b border-steel p-4 last:border-0 sm:grid-cols-[150px_minmax(0,1fr)]" key={entry.id}><p className={`font-mono text-[9px] uppercase tracking-[.11em] ${entry.tone}`}>{label(entry.date)}</p><div><p className="text-sm text-bone">{entry.title}</p><p className="mt-1 flex items-center gap-1 text-xs text-ghost"><MapPin className="h-3 w-3" />{entry.detail}</p></div></article>) : <p className="p-8 text-sm text-ghost">No future operating dates are on the field.</p>}</section></div></main>;
}
