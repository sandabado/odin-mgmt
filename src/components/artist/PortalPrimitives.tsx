import type { ReactNode } from "react";
import Link from "next/link";

export const portalDate = (value: string | null | undefined, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }) => {
  if (!value) return "Date pending";
  return new Intl.DateTimeFormat("en-US", options).format(new Date(`${value}T12:00:00`));
};

export const portalTime = (value: string | null | undefined) => {
  if (!value) return "Time pending";
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, hours, minutes));
};

export const portalMoney = (cents: number | null | undefined) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format((cents ?? 0) / 100);

export function PortalPageHeader({ eyebrow, title, copy, detail, children }: { eyebrow: string; title: string; copy: string; detail?: string; children?: ReactNode }) {
  return <header className="relative overflow-hidden border-b border-mercury bg-[radial-gradient(circle_at_83%_12%,rgba(176,38,255,.17),transparent_28%),linear-gradient(130deg,#0A0A0F,#050505)] px-5 py-9 sm:px-8 sm:py-12"><div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6"><div><p className="font-mono text-[9px] uppercase tracking-[.19em] text-plasma">{eyebrow}</p><h1 className="mt-4 max-w-3xl font-display text-5xl leading-[.87] sm:text-6xl">{title}</h1><p className="mt-5 max-w-2xl text-sm leading-6 text-ghost">{copy}</p></div>{detail ? <p className="border border-flux/50 bg-void/60 px-3 py-2 font-mono text-[9px] uppercase tracking-[.12em] text-flux">{detail}</p> : null}{children}</div></header>;
}

export function PortalSection({ eyebrow, title, detail, children, action }: { eyebrow: string; title: string; detail?: string; children: ReactNode; action?: { href: string; label: string } }) {
  return <section className="relative overflow-hidden border border-mercury bg-carbon p-5 sm:p-6"><span className="absolute right-0 top-0 h-px w-24 bg-gradient-to-l from-plasma to-transparent" /><div className="flex flex-wrap items-end justify-between gap-4 border-b border-steel pb-4"><div><p className="font-mono text-[9px] uppercase tracking-[.16em] text-plasma">{eyebrow}</p><h2 className="mt-2 font-display text-3xl leading-none">{title}</h2></div>{detail ? <p className="max-w-xs text-right font-mono text-[9px] uppercase tracking-[.11em] leading-4 text-ghost">{detail}</p> : null}{action ? <Link className="border border-mercury px-3 py-2 font-mono text-[9px] uppercase tracking-[.11em] text-flux transition hover:border-flux hover:bg-flux/10" href={action.href}>{action.label} →</Link> : null}</div>{children}</section>;
}

export function PortalEmpty({ children }: { children: ReactNode }) {
  return <p className="mt-5 border border-dashed border-steel bg-void/35 p-4 text-xs leading-5 text-ghost">{children}</p>;
}

export function PortalStatus({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "good" | "warning" | "danger" }) {
  const tones = { default: "border-mercury text-ghost", good: "border-flux/50 text-flux", warning: "border-halo/50 text-halo", danger: "border-red-400/50 text-red-300" };
  return <span className={`inline-flex border px-2 py-1 font-mono text-[8px] uppercase tracking-[.11em] ${tones[tone]}`}>{children}</span>;
}

export function PortalMetric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <article className="border border-steel bg-void/40 p-4"><p className="font-mono text-[9px] uppercase tracking-[.12em] text-ghost">{label}</p><p className="mt-3 font-display text-3xl leading-none text-bone">{value}</p>{detail ? <p className="mt-2 text-xs text-ghost">{detail}</p> : null}</article>;
}

export function NoArtistState({ isOperations }: { isOperations: boolean }) {
  return <main className="mx-auto flex min-h-[70vh] max-w-7xl items-center px-5 py-10 sm:px-8"><section className="max-w-2xl border border-mercury bg-carbon p-7 sm:p-10"><p className="font-mono text-[9px] uppercase tracking-[.18em] text-plasma">Artist connection pending</p><h1 className="mt-4 font-display text-5xl leading-none">No artist field is linked to this login.</h1><p className="mt-5 text-sm leading-6 text-ghost">{isOperations ? "Create or select an artist in the command hub to preview their daily operating field." : "An ØDIN administrator needs to connect this account to your artist record before your private schedule, setlists, gear, and promo materials can appear."}</p>{isOperations ? <Link className="mt-7 inline-flex border border-flux px-4 py-3 font-mono text-[9px] uppercase tracking-[.12em] text-flux transition hover:bg-flux hover:text-void" href="/admin/artists">Open artists →</Link> : null}</section></main>;
}
