import type { ReactNode } from "react";

const statusTone = {
  quiet: "border-steel bg-void/60 text-ghost",
  plasma: "border-plasma/60 bg-plasma/10 text-plasma",
  flux: "border-flux/60 bg-flux/10 text-flux",
  halo: "border-halo/60 bg-halo/10 text-halo",
  alert: "border-[#ff6b8a]/60 bg-[#ff6b8a]/10 text-[#ff8ba4]",
} as const;

export type SignalTone = keyof typeof statusTone;

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function IntelligencePanel({
  eyebrow,
  title,
  detail,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  detail?: string;
  children: ReactNode;
  className?: string;
}) {
  return <section className={cx("relative overflow-hidden border border-mercury bg-carbon p-5 sm:p-6", className)}>
    <div className="pointer-events-none absolute right-0 top-0 h-px w-24 bg-plasma" />
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-steel pb-4">
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[.16em] text-plasma">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl leading-none text-bone">{title}</h2>
      </div>
      {detail ? <p className="max-w-52 text-right font-mono text-[9px] uppercase leading-4 tracking-[.12em] text-ghost">{detail}</p> : null}
    </div>
    {children}
  </section>;
}

export function StatusBadge({ children, tone = "quiet" }: { children: ReactNode; tone?: SignalTone }) {
  return <span className={cx("inline-flex min-h-6 items-center border px-2 font-mono text-[8px] uppercase tracking-[.12em]", statusTone[tone])}>{children}</span>;
}

export function SignalTag({ children, tone = "quiet" }: { children: ReactNode; tone?: SignalTone }) {
  return <span className={cx("inline-flex max-w-full items-center border px-2 py-1 font-mono text-[8px] uppercase tracking-[.1em]", statusTone[tone])}>{children}</span>;
}

export function EmptyIntelligenceState({ children }: { children: ReactNode }) {
  return <p className="mt-5 border border-dashed border-steel bg-void/30 px-4 py-5 text-xs leading-5 text-ghost">{children}</p>;
}

export function DataLabel({ children }: { children: ReactNode }) {
  return <p className="font-mono text-[8px] uppercase tracking-[.12em] text-ghost">{children}</p>;
}
