import Link from "next/link";
import { redirect } from "next/navigation";
import { StudioHub } from "@/components/admin/StudioHub";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnvironment } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!hasSupabaseEnvironment()) {
    return <main className="min-h-screen bg-void p-6 text-bone sm:p-10"><section className="mx-auto max-w-3xl border border-mercury bg-carbon p-7 sm:p-10"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-plasma">Ødin / system configuration</p><h1 className="mt-5 font-display text-5xl leading-none">Connect the source.</h1><p className="mt-6 max-w-xl text-sm leading-6 text-ghost">The private operations layer is ready for Supabase. Add the project URL and a public Supabase key to your local environment, then apply the initial migration before creating the first administrator account.</p><code className="mt-7 block border border-mercury bg-void p-4 text-xs text-flux">NEXT_PUBLIC_SUPABASE_URL<br />NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY<br /><span className="text-ghost">or NEXT_PUBLIC_SUPABASE_ANON_KEY</span></code></section></main>;
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle();

  const [venues, contacts, activeDeals, activeProjects] = await Promise.all([
    supabase.from("venues").select("id", { count: "exact", head: true }),
    supabase.from("contacts").select("id", { count: "exact", head: true }),
    supabase.from("deals").select("id", { count: "exact", head: true }).eq("stage", "negotiating"),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "in_progress"),
  ]);
  const pulse = [
    { label: "Active deals", value: activeDeals.count ?? 0, detail: "Negotiating in the field", href: "/admin/deals" },
    { label: "Live projects", value: activeProjects.count ?? 0, detail: "Release work in motion", href: "/admin/artists" },
    { label: "Venues", value: venues.count ?? 0, detail: "Rooms held in the network", href: "/admin/venues" },
    { label: "Contacts", value: contacts.count ?? 0, detail: "Relationships in memory", href: "/admin/contacts" },
  ];

  return <main className="min-h-screen bg-void p-5 text-bone sm:p-8"><div className="mx-auto max-w-7xl"><header className="flex flex-wrap items-start justify-between gap-5 border-b border-mercury pb-6"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-plasma">Ødin Management / private operations</p><h1 className="mt-3 font-display text-4xl leading-none">Good to see you, {profile?.full_name || user.email}.</h1></div><div className="border border-flux px-3 py-2 font-mono text-[10px] uppercase tracking-[.12em] text-flux">{profile?.role || "profile pending"}</div></header><section className="mt-5 grid gap-px border border-mercury bg-mercury sm:grid-cols-2 xl:grid-cols-4">{pulse.map((item) => <Link className="group bg-carbon p-4 transition hover:bg-steel hover:shadow-[inset_0_0_0_1px_rgba(0,255,194,.72)]" href={item.href} key={item.label}><p className="font-mono text-[9px] uppercase tracking-[.14em] text-ghost">{item.label}</p><p className="mt-3 font-display text-4xl leading-none text-flux">{item.value}</p><p className="mt-2 text-[10px] leading-4 text-ghost">{item.detail}</p><p className="mt-4 font-mono text-[9px] uppercase tracking-[.13em] text-flux opacity-0 transition group-hover:opacity-100">Open field →</p></Link>)}</section><div className="mt-7"><StudioHub /></div></div></main>;
}
