import Link from "next/link";
import type { ReactNode } from "react";

const modules = [
  { href: "/admin/band-ops/run-sheets", label: "Run sheets" },
  { href: "/admin/band-ops/setlists", label: "Setlists" },
  { href: "/admin/band-ops/meetings", label: "Meetings" },
  { href: "/admin/band-ops/stage-plots", label: "Stage plots" },
  { href: "/admin/band-ops/gear", label: "Gear" },
];

type BandOpsFrameProps = {
  active: string;
  eyebrow: string;
  title: string;
  description: string;
  count: number;
  countLabel: string;
  children: ReactNode;
};

export function BandOpsFrame({ active, eyebrow, title, description, count, countLabel, children }: BandOpsFrameProps) {
  return <main className="min-h-screen bg-void px-5 py-8 text-bone sm:px-8">
    <div className="mx-auto max-w-7xl">
      <header className="border-b border-mercury pb-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <Link className="font-mono text-[10px] uppercase tracking-[.16em] text-ghost hover:text-flux" href="/admin">← Command hub</Link>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[.18em] text-plasma">øDIN Management / {eyebrow}</p>
            <h1 className="mt-3 font-display text-5xl leading-none">{title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-ghost">{description}</p>
          </div>
          <p className="border border-flux px-3 py-2 font-mono text-[10px] uppercase tracking-[.12em] text-flux">{count} {countLabel}</p>
        </div>
        <nav aria-label="Band operations" className="mt-6 flex flex-wrap gap-2">
          {modules.map((module) => <Link className={`border px-3 py-2 font-mono text-[9px] uppercase tracking-[.12em] transition ${module.href === active ? "border-plasma bg-plasma text-void" : "border-steel text-ghost hover:border-flux hover:text-flux"}`} href={module.href} key={module.href}>{module.label}</Link>)}
        </nav>
      </header>
      {children}
    </div>
  </main>;
}

export function BandOpsEmptyState({ actionHref = "/admin/artists", actionLabel = "Open artist studios" }: { actionHref?: string; actionLabel?: string }) {
  return <section className="mt-6 border border-dashed border-steel bg-carbon/60 p-7 sm:p-9">
    <p className="font-mono text-[9px] uppercase tracking-[.16em] text-plasma">Field awaiting input</p>
    <h2 className="mt-3 font-display text-3xl leading-none">Nothing is lost—this field is simply unstarted.</h2>
    <p className="mt-3 max-w-xl text-sm leading-6 text-ghost">Use the artist studio to establish the next operational artifact. Once it is created, the shared record will be visible here for the whole management team.</p>
    <Link className="mt-5 inline-flex border border-flux px-4 py-3 font-mono text-[10px] uppercase tracking-[.12em] text-flux transition hover:bg-flux hover:text-void" href={actionHref}>{actionLabel} →</Link>
  </section>;
}
