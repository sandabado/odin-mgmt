import { redirect } from "next/navigation";
import { TreasuryQuincunx } from "@/components/admin/TreasuryQuincunx";
import { formatUsd, summarizeRevenue, type StudioArm } from "@/lib/treasury/feed-first";
import { hasSupabaseEnvironment } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type RevenueRow = { project_id: string | null; arm: StudioArm; amount_cents: number };
type ProjectRow = { id: string; project_code: string; title: string; investment_cents: number; status: string };
type PayoutRow = { amount_cents: number; due_on: string | null };

function startOfCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export default async function TreasuryPage() {
  if (!hasSupabaseEnvironment()) {
    return <main className="min-h-screen bg-void p-6 text-bone sm:p-10"><section className="mx-auto max-w-3xl border border-mercury bg-carbon p-7 sm:p-10"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-plasma">Whole Body Studios / treasury configuration</p><h1 className="mt-5 font-display text-5xl leading-none">The center is waiting.</h1><p className="mt-6 max-w-xl text-sm leading-6 text-ghost">Connect Supabase, then apply the Studio Treasury migration after the existing Phase 1 and Network migrations. The Quinconx will report only real ledger entries—never invented revenue.</p></section></main>;
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/treasury");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "super_admin") redirect("/admin");

  const monthStart = startOfCurrentMonth();
  const [{ data: monthRevenue, error: revenueError }, { data: allRevenue }, { data: projects }, { data: pendingPayouts }] = await Promise.all([
    supabase.from("revenue_ledger").select("project_id, arm, amount_cents").gte("received_on", monthStart).returns<RevenueRow[]>(),
    supabase.from("revenue_ledger").select("project_id, arm, amount_cents").returns<RevenueRow[]>(),
    supabase.from("projects").select("id, project_code, title, investment_cents, status").order("created_at", { ascending: false }).returns<ProjectRow[]>(),
    supabase.from("payouts").select("amount_cents, due_on").eq("status", "pending").returns<PayoutRow[]>(),
  ]);

  const monthly = summarizeRevenue((monthRevenue ?? []).map((entry) => ({ arm: entry.arm, amountCents: entry.amount_cents })));
  const historicRevenue = allRevenue ?? [];
  const projectRows = projects ?? [];
  const pendingPayoutCents = (pendingPayouts ?? []).reduce((total, payout) => total + payout.amount_cents, 0);
  const projectSummaries = projectRows.map((project) => {
    const revenueCents = historicRevenue.filter((entry) => entry.project_id === project.id).reduce((total, entry) => total + entry.amount_cents, 0);
    const profitCents = revenueCents - project.investment_cents;
    const roi = project.investment_cents ? Math.round((profitCents / project.investment_cents) * 100) : null;
    return { ...project, revenueCents, profitCents, roi };
  });

  return <main className="min-h-screen bg-void px-5 py-8 text-bone sm:px-8"><div className="mx-auto max-w-7xl"><header className="flex flex-wrap items-end justify-between gap-5 border-b border-mercury pb-6"><div><a href="/admin" className="font-mono text-[10px] uppercase tracking-[.16em] text-ghost transition hover:text-flux">← Operations</a><p className="mt-5 font-mono text-[10px] uppercase tracking-[.18em] text-plasma">Whole Body Studios / central treasury</p><h1 className="mt-3 font-display text-5xl leading-none">The center holds the value.</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-ghost">A single, real-time ledger for the four studio arms—designed around Feed First, so artists are paid before the system grows.</p></div><div className="border border-flux px-4 py-3 font-mono text-[10px] uppercase tracking-[.14em] text-flux">Super-admin field</div></header><div className="mt-7"><TreasuryQuincunx totalCents={monthly.totalCents} byArm={monthly.byArm} /></div><section className="mt-4 grid gap-3 border border-mercury bg-mercury sm:grid-cols-2 lg:grid-cols-4"><Metric label="Artist share · 50%" value={formatUsd(monthly.allocation.artist)} /><Metric label="Guild share · 25%" value={formatUsd(monthly.allocation.guild)} /><Metric label="Infrastructure · 15%" value={formatUsd(monthly.allocation.infrastructure)} /><Metric label="Pending payouts" value={formatUsd(pendingPayoutCents)} /></section><section className="mt-7 border border-mercury bg-carbon"><header className="flex flex-wrap items-end justify-between gap-4 border-b border-mercury p-5"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-plasma">Project profitability</p><h2 className="mt-2 font-display text-3xl leading-none">Every project carries its own story.</h2></div><p className="font-mono text-[10px] uppercase tracking-[.12em] text-ghost">{revenueError ? "Revenue field unavailable" : `${projectSummaries.length} tracked projects`}</p></header>{projectSummaries.length ? <div className="divide-y divide-mercury">{projectSummaries.map((project) => <article className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_repeat(3,auto)] sm:items-center" key={project.id}><div><p className="font-mono text-[10px] uppercase tracking-[.13em] text-ghost">{project.project_code} · {project.status.replaceAll("_", " ")}</p><h3 className="mt-2 font-display text-2xl leading-none">{project.title}</h3></div><Value label="Investment" value={formatUsd(project.investment_cents)} /><Value label="Revenue" value={formatUsd(project.revenueCents)} /><Value label={project.roi === null ? "ROI" : `ROI · ${project.roi}%`} value={formatUsd(project.profitCents)} /></article>)}</div> : <div className="p-8 sm:p-12"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-plasma">No project ledger yet</p><p className="mt-4 max-w-xl text-sm leading-6 text-ghost">Create a project, record the investment, and let each studio arm append timeline and revenue events. The dashboard will calculate the Treasury from those entries.</p></div>}</section></div></main>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="bg-carbon p-5"><p className="font-mono text-[10px] uppercase tracking-[.12em] text-ghost">{label}</p><p className="mt-4 font-display text-3xl leading-none">{value}</p></article>;
}

function Value({ label, value }: { label: string; value: string }) {
  return <div className="sm:text-right"><p className="font-mono text-[10px] uppercase tracking-[.12em] text-ghost">{label}</p><p className="mt-2 font-display text-2xl leading-none">{value}</p></div>;
}
