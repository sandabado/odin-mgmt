import { redirect } from "next/navigation";
import { StudioHub } from "@/components/admin/StudioHub";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnvironment } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!hasSupabaseEnvironment()) {
    return <main className="min-h-screen bg-void p-6 text-bone sm:p-10"><section className="mx-auto max-w-3xl border border-mercury bg-carbon p-7 sm:p-10"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-plasma">Odin / system configuration</p><h1 className="mt-5 font-display text-5xl leading-none">Connect the source.</h1><p className="mt-6 max-w-xl text-sm leading-6 text-ghost">The private operations layer is ready for Supabase. Add the project URL and a public Supabase key to your local environment, then apply the initial migration before creating the first administrator account.</p><code className="mt-7 block border border-mercury bg-void p-4 text-xs text-flux">NEXT_PUBLIC_SUPABASE_URL<br />NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY<br /><span className="text-ghost">or NEXT_PUBLIC_SUPABASE_ANON_KEY</span></code></section></main>;
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle();

  return <main className="min-h-screen bg-void p-5 text-bone sm:p-8"><div className="mx-auto max-w-7xl"><header className="flex flex-wrap items-start justify-between gap-5 border-b border-mercury pb-6"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-plasma">Odin Management / private operations</p><h1 className="mt-3 font-display text-4xl leading-none">Good to see you, {profile?.full_name || user.email}.</h1></div><div className="border border-flux px-3 py-2 font-mono text-[10px] uppercase tracking-[.12em] text-flux">{profile?.role || "profile pending"}</div></header><div className="mt-7"><StudioHub /></div></div></main>;
}
