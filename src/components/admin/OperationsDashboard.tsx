"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, CalendarDays, Disc3, Flame, FolderKanban, Landmark, MailOpen, Megaphone, Radio, Repeat2, UsersRound, WalletCards } from "lucide-react";
import { LoginSplash } from "@/components/admin/LoginSplash";
import { OdinMark } from "@/components/OdinMark";

export type DashboardLiveItem = { id: string; tone: "live" | "attention" | "critical" | "positive"; label: string; title: string; detail: string; href: string; action: string };
export type DashboardCard = { id: string; label: string; value: string; detail: string; status: string; tone: "good" | "attention" | "urgent" | "quiet"; href: string; icon: "leads" | "replies" | "upcoming" | "cash" | "swaps" | "campaigns" | "deals" | "treasury" };
export type DashboardArm = { id: string; label: string; description: string; activity: string; metric: string; alert?: string; href: string; color: "plasma" | "flux" | "blue" | "halo" | "bone" };
export type DashboardActivity = { id: string; description: string; createdAt: string; href: string; tone: "plasma" | "flux" | "halo" | "ghost" };
export type DashboardQuickLink = { id: string; label: string; count: string; context: string; href: string; icon: "contacts" | "projects" | "promo" | "upcoming" | "venues" | "swaps" };
export type DashboardCountdown = { title: string; date: string; artist: string; days: number; phase: string; phasePosition: number; href: string } | null;

export type OperationsDashboardProps = {
  user: { id: string; fullName: string; role: string; lastLogin?: string | null };
  liveItems: DashboardLiveItem[];
  countdown: DashboardCountdown;
  cards: DashboardCard[];
  arms: DashboardArm[];
  activity: DashboardActivity[];
  quickLinks: DashboardQuickLink[];
  generatedAt: string;
};

const iconByCard = { leads: Flame, replies: MailOpen, upcoming: CalendarDays, cash: WalletCards, swaps: Repeat2, campaigns: Megaphone, deals: BriefcaseBusiness, treasury: Landmark };
const iconByQuickLink = { contacts: UsersRound, projects: FolderKanban, promo: Disc3, upcoming: CalendarDays, venues: Radio, swaps: Repeat2 };
const dateLabel = (date: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00`));

function relativeTime(timestamp: string) {
  const difference = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.max(0, Math.round(difference / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(timestamp));
}

function DashboardGreeting({ fullName, role, lastLogin }: { fullName: string; role: string; lastLogin?: string | null }) {
  const [hour, setHour] = useState<number | null>(null);
  useEffect(() => setHour(new Date().getHours()), []);
  const firstName = fullName.split(" ")[0] || "there";
  const greeting = hour === null ? `The center holds, ${firstName}.` : hour >= 5 && hour < 12 ? `The field is still. Grand rising, ${firstName}.` : hour < 17 ? `The arms are moving. The day is in motion, ${firstName}.` : hour < 21 ? `The light is fading. Ease into the work, ${firstName}.` : `Still building. The field is quiet, ${firstName}.`;
  return <header className="border-b border-mercury pb-6"><p className="font-mono text-xs uppercase tracking-[.18em] text-plasma">Dashboard</p><h1 className="mt-3 font-display text-4xl leading-none sm:text-5xl">{greeting}</h1><div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-[.12em] text-ghost"><span className="h-1.5 w-1.5 rounded-full bg-flux shadow-[0_0_8px_rgba(0,255,194,.85)]" /> <span>{fullName}</span><span>·</span><span>{role.replaceAll("_", " ")}</span><span>·</span><span>Whole Body Records</span>{lastLogin ? <><span>·</span><span>Last login {relativeTime(lastLogin)}</span></> : null}</div></header>;
}

function LiveNow({ items, generatedAt }: { items: DashboardLiveItem[]; generatedAt: string }) {
  const router = useRouter();
  useEffect(() => { const poll = window.setInterval(() => router.refresh(), 60_000); return () => window.clearInterval(poll); }, [router]);
  const refreshedAt = useMemo(() => new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(generatedAt)), [generatedAt]);
  const tone = { live: "border-flux/40 bg-flux/5 text-flux", attention: "border-halo/40 bg-halo/5 text-halo", critical: "border-plasma/50 bg-plasma/5 text-plasma", positive: "border-flux/40 bg-flux/5 text-flux" };
  return <section className="border border-mercury bg-carbon/95 shadow-[0_18px_45px_rgba(0,0,0,.12)]"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-mercury px-5 py-4"><div><p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[.1em] text-bone"><span className="h-2 w-2 rounded-full bg-flux shadow-[0_0_8px_rgba(141,219,201,.45)]" />Live now</p><p className="mt-1 text-sm text-ghost">What is happening across the field in this moment.</p></div><p className="font-mono text-xs tracking-[.08em] text-ghost">Updated {refreshedAt} · refreshes each minute</p></header><div className="p-3 sm:p-4">{items.length ? <div className="grid gap-2">{items.map((item) => <Link className="group grid gap-3 border border-steel bg-void/40 p-4 transition hover:border-ghost hover:bg-steel/70 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center" href={item.href} key={item.id}><div><p className={`font-mono text-[11px] uppercase tracking-[.08em] ${tone[item.tone]}`}>{item.label}</p><p className="mt-2 text-base text-bone">{item.title}</p><p className="mt-1 text-sm leading-5 text-ghost">{item.detail}</p></div><span className="inline-flex items-center gap-1 font-mono text-[11px] tracking-[.08em] text-flux">{item.action}<ArrowUpRight className="h-3.5 w-3.5" /></span></Link>)}</div> : <div className="border border-dashed border-steel p-6"><p className="font-mono text-xs tracking-[.08em] text-ghost">● The field is quiet.</p><p className="mt-2 text-sm text-ghost">No active sessions, practices, or urgent leads right now.</p></div>}</div></section>;
}

function CountdownClock({ countdown }: { countdown: DashboardCountdown }) {
  const phases = ["Recording", "Mixing", "Master", "Distribution", "PR", "Booking"];
  if (!countdown) return <section className="border border-dashed border-steel bg-carbon px-5 py-8"><p className="font-mono text-xs uppercase tracking-[.15em] text-ghost">Mission clock</p><h2 className="mt-3 font-display text-3xl leading-none">No shows scheduled. The field awaits.</h2></section>;
  return <Link className="group block overflow-hidden border border-plasma/45 bg-[radial-gradient(circle_at_85%_15%,rgba(176,38,255,.2),transparent_28%),#0a0a0f] p-5 transition hover:border-plasma sm:p-7" href={countdown.href}><div className="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center"><p className="font-display text-7xl leading-none text-plasma drop-shadow-[0_0_24px_rgba(176,38,255,.48)] sm:text-8xl">{countdown.days}</p><div><p className="font-mono text-xs uppercase tracking-[.18em] text-plasma">Days until {countdown.title}</p><h2 className="mt-3 font-display text-3xl leading-none text-bone sm:text-4xl">{dateLabel(countdown.date)} · {countdown.artist}</h2><div className="mt-5 flex flex-wrap gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-[.1em]">{phases.map((phase, index) => <span className={index < countdown.phasePosition ? "text-flux" : index === countdown.phasePosition ? "text-plasma" : "text-ghost"} key={phase}>{index < countdown.phasePosition ? "✓" : index === countdown.phasePosition ? "●" : "○"} {phase}{index < phases.length - 1 ? " →" : ""}</span>)}</div><p className="mt-3 text-xs text-ghost">Current phase: {countdown.phase}</p></div></div><span className="mt-5 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[.12em] text-flux opacity-0 transition group-hover:opacity-100">Open show record <ArrowUpRight className="h-3.5 w-3.5" /></span></Link>;
}

function MorningCards({ cards }: { cards: DashboardCard[] }) {
  const tone = { good: "text-flux", attention: "text-halo", urgent: "text-plasma", quiet: "text-ghost" };
  return <section><SectionTitle eyebrow="Daily briefing" title="Morning cards" detail="The points that need a decision, a reply, or a glance." /><div className="mt-4 grid gap-px border border-mercury bg-mercury sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => { const Icon = iconByCard[card.icon]; return <Link className="group bg-carbon p-4 transition hover:bg-steel hover:shadow-[inset_0_0_0_1px_rgba(176,38,255,.8)]" href={card.href} key={card.id}><div className="flex items-center justify-between"><p className="font-mono text-[11px] uppercase tracking-[.13em] text-ghost">{card.label}</p><Icon className={`h-4 w-4 ${tone[card.tone]}`} /></div><p className={`mt-5 font-display text-4xl leading-none ${tone[card.tone]}`}>{card.value}</p><p className="mt-2 min-h-8 text-xs leading-4 text-ghost">{card.detail}</p><div className="mt-5 flex items-end justify-between gap-3"><p className={`font-mono text-[10px] uppercase tracking-[.1em] ${tone[card.tone]}`}>● {card.status}</p><ArrowUpRight className="h-3.5 w-3.5 text-flux opacity-0 transition group-hover:opacity-100" /></div></Link>; })}</div></section>;
}

function ArmStatus({ arms }: { arms: DashboardArm[] }) {
  const color = { plasma: "border-l-plasma", flux: "border-l-flux", blue: "border-l-[#4A90D9]", halo: "border-l-halo", bone: "border-l-bone" };
  return <section><SectionTitle eyebrow="The five arms" title="The center holds." detail="Every arm has work in motion, and every signal returns to Ø." /><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">{arms.map((arm) => <Link className={`group flex min-h-56 flex-col border border-mercury border-l-4 ${color[arm.color]} bg-carbon p-4 transition hover:bg-steel`} href={arm.href} key={arm.id}><div><p className="font-mono text-xs uppercase tracking-[.15em] text-bone">{arm.label}</p><p className="mt-2 text-xs text-ghost">● {arm.description}</p></div><div className="mt-7"><p className="font-mono text-[11px] uppercase tracking-[.1em] text-flux">Active</p><p className="mt-2 text-sm leading-5 text-bone">{arm.activity}</p><p className="mt-3 text-xs text-ghost">{arm.metric}</p></div><div className="mt-auto pt-6">{arm.alert ? <p className="font-mono text-[10px] uppercase leading-4 tracking-[.09em] text-halo">Alert · {arm.alert}</p> : <p className="font-mono text-[10px] uppercase tracking-[.09em] text-ghost">No immediate alert</p>}<p className="mt-4 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[.12em] text-flux">Enter arm <ArrowUpRight className="h-3.5 w-3.5" /></p></div></Link>)}</div></section>;
}

function ActivityFeed({ activity }: { activity: DashboardActivity[] }) {
  const dots = { plasma: "bg-plasma", flux: "bg-flux", halo: "bg-halo", ghost: "bg-ghost" };
  return <section className="border border-mercury bg-carbon"><header className="border-b border-mercury px-5 py-4"><p className="font-mono text-xs uppercase tracking-[.16em] text-plasma">Recent activity</p><h2 className="mt-2 font-display text-3xl leading-none">The record is moving.</h2></header>{activity.length ? <div>{activity.map((item) => <Link className="group grid grid-cols-[auto_74px_minmax(0,1fr)_auto] items-center gap-3 border-b border-steel px-4 py-4 transition last:border-0 hover:bg-steel sm:px-5" href={item.href} key={item.id}><span className={`h-2 w-2 rounded-full ${dots[item.tone]}`} /><span className="font-mono text-[10px] uppercase tracking-[.1em] text-ghost">{relativeTime(item.createdAt)}</span><p className="text-sm text-bone">{item.description}</p><ArrowUpRight className="h-3.5 w-3.5 text-ghost transition group-hover:text-flux" /></Link>)}</div> : <p className="p-6 text-sm text-ghost">No recorded activity yet. The feed will fill as work moves through the system.</p>}</section>;
}

function QuickAccess({ links }: { links: DashboardQuickLink[] }) {
  return <section><SectionTitle eyebrow="Quick access" title="Cross-arm resources" detail="The shared records that keep the whole body connected." /><div className="mt-4 grid gap-px border border-mercury bg-mercury sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{links.map((link) => { const Icon = iconByQuickLink[link.icon]; return <Link className="group bg-carbon p-4 transition hover:bg-steel" href={link.href} key={link.id}><Icon className="h-4 w-4 text-flux" /><p className="mt-4 font-display text-2xl leading-none">{link.count} <span className="font-mono text-[11px] uppercase tracking-[.1em] text-ghost">{link.label}</span></p><p className="mt-2 text-xs leading-4 text-ghost">{link.context}</p></Link>; })}</div></section>;
}

function SectionTitle({ eyebrow, title, detail }: { eyebrow: string; title: string; detail: string }) {
  return <header><p className="font-mono text-[11px] uppercase tracking-[.17em] text-plasma">{eyebrow}</p><h2 className="mt-2 font-display text-3xl leading-none text-bone">{title}</h2><p className="mt-2 text-xs text-ghost">{detail}</p></header>;
}

export function OperationsDashboard({ user, liveItems, countdown, cards, arms, activity, quickLinks, generatedAt }: OperationsDashboardProps) {
  return <main className="relative isolate min-h-screen overflow-hidden bg-void px-5 py-8 text-bone sm:px-8"><div aria-hidden="true" className="pointer-events-none fixed right-[-8rem] top-28 z-0 w-72 opacity-[.055] blur-[1px] sm:right-[-4rem] sm:w-96 lg:right-8 lg:w-[30rem]"><OdinMark alt="" className="dashboard-orbit-object h-auto w-full" variant="orbit" /></div><LoginSplash userId={user.id} /><div className="relative z-10 mx-auto grid max-w-7xl gap-8"><DashboardGreeting fullName={user.fullName} lastLogin={user.lastLogin} role={user.role} /><LiveNow generatedAt={generatedAt} items={liveItems} /><CountdownClock countdown={countdown} /><MorningCards cards={cards} /><ArmStatus arms={arms} /><ActivityFeed activity={activity} /><QuickAccess links={quickLinks} /></div></main>;
}
