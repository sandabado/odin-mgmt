import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnvironment } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!hasSupabaseEnvironment()) {
    return <main className="min-h-screen bg-void p-6 text-bone sm:p-10"><section className="mx-auto max-w-3xl border border-mercury bg-carbon p-7 sm:p-10"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-plasma">Odin / system configuration</p><h1 className="mt-5 font-display text-5xl leading-none">Connect the source.</h1><p className="mt-6 max-w-xl text-sm leading-6 text-ghost">The private operations layer is ready for Supabase. Add the project URL and publishable key to your local environment, then apply the initial migration before creating the first administrator account.</p><code className="mt-7 block border border-mercury bg-void p-4 text-xs text-flux">NEXT_PUBLIC_SUPABASE_URL<br />NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code></section></main>;
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle();

  return <main className="min-h-screen bg-void p-5 text-bone sm:p-8"><div className="mx-auto max-w-7xl"><header className="flex flex-wrap items-start justify-between gap-5 border-b border-mercury pb-6"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-plasma">Odin Management / private operations</p><h1 className="mt-3 font-display text-4xl leading-none">Good to see you, {profile?.full_name || user.email}.</h1></div><div className="border border-flux px-3 py-2 font-mono text-[10px] uppercase tracking-[.12em] text-flux">{profile?.role || "profile pending"}</div></header><section className="mt-7 grid gap-px border border-mercury bg-mercury sm:grid-cols-3"><Status label="Venues" value="Phase 2" note="Database module next" /><Status label="Leads" value="Phase 2" note="Scoring system next" /><Status label="Contracts" value="Phase 2" note="Protected workflow next" /></section><section className="mt-7 border border-mercury bg-carbon p-6 sm:p-8"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-plasma">Foundation complete</p><h2 className="mt-3 font-display text-3xl">Auth, roles, and row-level policies are in the repo.</h2><p className="mt-4 max-w-2xl text-sm leading-6 text-ghost">This protected entry point stays intentionally quiet until the Supabase migration is applied and the first account is confirmed. Once that foundation is tested, venues are the next module—not a dashboard of placeholder data.</p></section></div></main>;
}

function Status({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className="bg-carbon p-5"><p className="font-mono text-[10px] uppercase tracking-[.14em] text-ghost">{label}</p><p className="mt-5 font-display text-3xl">{value}</p><p className="mt-2 text-xs text-ghost">{note}</p></article>;
}
