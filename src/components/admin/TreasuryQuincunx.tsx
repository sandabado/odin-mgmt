import { formatUsd, type StudioArm } from "@/lib/treasury/feed-first";

type TreasuryQuincunxProps = {
  totalCents: number;
  byArm: Record<StudioArm, number>;
};

const armDetails: Record<StudioArm, { label: string; signal: string; position: string }> = {
  pr: { label: "PR", signal: "Press · Media · Campaigns", position: "sm:col-start-2 sm:row-start-1" },
  records: { label: "Records", signal: "Publishing · Sync · Distribution", position: "sm:col-start-1 sm:row-start-2" },
  engineering: { label: "Engineering", signal: "Recording · Mixing · Mastering", position: "sm:col-start-3 sm:row-start-2" },
  management: { label: "Management", signal: "Odin · Booking · Relationships", position: "sm:col-start-2 sm:row-start-3" },
};

export function TreasuryQuincunx({ totalCents, byArm }: TreasuryQuincunxProps) {
  return <section className="relative overflow-hidden border border-mercury bg-carbon p-5 sm:p-8"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(176,38,255,.16),transparent_34%)]" /><div className="relative"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-plasma">The Quinconx / Whole Body Studios</p><h2 className="mt-2 font-display text-3xl leading-none">Every arm feeds the center.</h2></div><p className="font-mono text-[10px] uppercase tracking-[.12em] text-ghost">Current calendar month</p></div><div className="relative mt-8 grid gap-3 sm:grid-cols-3 sm:grid-rows-3 sm:gap-0">{(["pr", "records", "engineering", "management"] as const).map((arm) => <article className={`border border-steel bg-void/80 p-4 sm:min-h-32 ${armDetails[arm].position}`} key={arm}><p className="font-mono text-[10px] uppercase tracking-[.14em] text-ghost">{armDetails[arm].label}</p><p className="mt-5 font-display text-3xl">{formatUsd(byArm[arm])}</p><p className="mt-2 text-[11px] leading-4 text-ghost">{armDetails[arm].signal}</p></article>)}<div className="flex min-h-40 flex-col items-center justify-center border border-flux bg-[radial-gradient(circle,rgba(176,38,255,.3),rgba(5,5,5,.94)_70%)] p-5 text-center sm:col-start-2 sm:row-start-2"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-flux">Ø Central Treasury</p><p className="mt-3 font-display text-5xl leading-none">{formatUsd(totalCents)}</p><p className="mt-3 text-xs text-ghost">Whole Body Studios</p></div></div></div></section>;
}
