"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, CalendarDays, Disc3, Flame, FolderKanban, Landmark, MailOpen, Megaphone, Radio, Repeat2, UsersRound, WalletCards } from "lucide-react";
import { LoginSplash } from "@/components/admin/LoginSplash";
import { OdinOrbitMark } from "@/components/OdinOrbitMark";

export type DashboardLiveItem = { id: string; tone: "live" | "attention" | "critical" | "positive"; label: string; title: string; detail: string; href: string; action: string };
export type DashboardCard = { id: string; label: string; value: string; detail: string; status: string; tone: "good" | "attention" | "urgent" | "quiet"; href: string; icon: "leads" | "replies" | "upcoming" | "cash" | "swaps" | "campaigns" | "deals" | "treasury" };
export type DashboardArm = { id: string; label: string; description: string; activity: string; metric: string; alert?: string; href: string; color: "plasma" | "flux" | "blue" | "halo" | "bone" };
export type DashboardActivity = { id: string; description: string; createdAt: string; href: string; tone: "plasma" | "flux" | "halo" | "ghost" };
export type DashboardQuickLink = { id: string; label: string; count: string; context: string; href: string; icon: "contacts" | "projects" | "promo" | "upcoming" | "venues" | "swaps" };
export type DashboardCountdown = { title: string; date: string; artist: string; days: number; phase: string; phasePosition: number; href: string } | null;
export type DashboardCalendarEntry = { id: string; date: string; title: string; detail: string; tone: "show" | "meeting" | "practice" | "release" };

export type OperationsDashboardProps = {
  user: { id: string; fullName: string; role: string; lastLogin?: string | null };
  liveItems: DashboardLiveItem[];
  countdown: DashboardCountdown;
  calendarEntries: DashboardCalendarEntry[];
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
  return <header className="admin-dashboard__section border-b border-mercury py-4 sm:py-6"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-plasma">Dashboard</p><h1 className="mt-3 max-w-4xl font-display text-4xl leading-[.95] sm:text-5xl">{greeting}</h1><div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[.12em] text-ghost"><span className="h-1.5 w-1.5 rounded-full bg-flux shadow-[0_0_8px_rgba(141,219,201,.5)]" /> <span>{fullName}</span><span>·</span><span>{role.replaceAll("_", " ")}</span><span>·</span><span>Whole Body Records</span>{lastLogin ? <><span>·</span><span>Last login {relativeTime(lastLogin)}</span></> : null}</div></header>;
}

function LiveNow({ items, generatedAt }: { items: DashboardLiveItem[]; generatedAt: string }) {
  const router = useRouter();
  useEffect(() => { const poll = window.setInterval(() => router.refresh(), 60_000); return () => window.clearInterval(poll); }, [router]);
  const refreshedAt = useMemo(() => new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(generatedAt)), [generatedAt]);
  const tone = { live: "border-flux/40 bg-flux/5 text-flux", attention: "border-halo/40 bg-halo/5 text-halo", critical: "border-plasma/50 bg-plasma/5 text-plasma", positive: "border-flux/40 bg-flux/5 text-flux" };
  return <section className="admin-panel admin-dashboard__section"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-mercury px-5 py-5"><div><p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.12em] text-bone"><span className="h-2 w-2 rounded-full bg-flux shadow-[0_0_8px_rgba(141,219,201,.32)]" />Live now</p><p className="mt-1 text-sm text-ghost">What is moving across the field in this moment.</p></div><p className="font-mono text-[9px] tracking-[.08em] text-ghost">Updated {refreshedAt} · each minute</p></header><div className="p-3 sm:p-4">{items.length ? <div className="grid gap-2">{items.map((item) => <Link className="admin-card admin-lift group grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center" href={item.href} key={item.id}><div><p className={`font-mono text-[10px] uppercase tracking-[.1em] ${tone[item.tone]}`}>{item.label}</p><p className="mt-2 text-base text-bone">{item.title}</p><p className="mt-1 text-sm leading-5 text-ghost">{item.detail}</p></div><span className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[.08em] text-flux">{item.action}<ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span></Link>)}</div> : <div className="rounded-[18px] border border-dashed border-steel p-6"><p className="font-mono text-[10px] tracking-[.08em] text-ghost">● The field is quiet.</p><p className="mt-2 text-sm text-ghost">No active sessions, practices, or urgent leads right now.</p></div>}</div></section>;
}

function CountdownClock({ countdown }: { countdown: DashboardCountdown }) {
  const phases = ["Recording", "Mixing", "Master", "Distribution", "PR", "Booking"];
  if (!countdown) return <section className="admin-panel admin-dashboard__section border-dashed px-5 py-8"><p className="font-mono text-[10px] uppercase tracking-[.15em] text-ghost">Mission clock</p><h2 className="mt-3 font-display text-3xl leading-none">No shows scheduled. The field awaits.</h2></section>;
  return <Link className="admin-panel admin-lift admin-dashboard__section group block bg-[radial-gradient(circle_at_88%_10%,rgba(185,166,255,.12),transparent_31%)] p-5 sm:p-7" href={countdown.href}><div className="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center"><p className="font-display text-7xl leading-none text-plasma drop-shadow-[0_0_24px_rgba(185,166,255,.24)] sm:text-8xl">{countdown.days}</p><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-plasma">Days until {countdown.title}</p><h2 className="mt-3 font-display text-3xl leading-none text-bone sm:text-4xl">{dateLabel(countdown.date)} · {countdown.artist}</h2><div className="mt-5 flex flex-wrap gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[.1em]">{phases.map((phase, index) => <span className={index < countdown.phasePosition ? "text-flux" : index === countdown.phasePosition ? "text-plasma" : "text-ghost"} key={phase}>{index < countdown.phasePosition ? "✓" : index === countdown.phasePosition ? "●" : "○"} {phase}{index < phases.length - 1 ? " →" : ""}</span>)}</div><p className="mt-3 text-xs text-ghost">Current phase: {countdown.phase}</p></div></div><span className="mt-5 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[.12em] text-flux opacity-70 transition-opacity duration-300 group-hover:opacity-100">Open show record <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span></Link>;
}

function OperationsCalendar({ entries }: { entries: DashboardCalendarEntry[] }) {
  const tones = { show: "text-flux", meeting: "text-halo", practice: "text-plasma", release: "text-ghost" };
  const calendarDate = (date: string) => new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(`${date}T00:00:00`));
  return <section className="admin-panel admin-dashboard__section scroll-mt-[110px]" id="operations-calendar"><header className="flex flex-wrap items-start justify-between gap-4 border-b border-mercury px-5 py-5 sm:px-6"><div><p className="font-mono text-[10px] uppercase tracking-[.17em] text-plasma">Operating schedule</p><h2 className="mt-2 font-display text-3xl leading-none text-bone">Everything, in time.</h2><p className="mt-2 text-xs leading-5 text-ghost">Shows, meetings, practices, and release targets in the order the team needs them.</p></div><div className="flex items-center gap-2 rounded-full border border-flux/20 bg-flux/5 px-3 py-2 font-mono text-[9px] uppercase tracking-[.12em] text-flux"><CalendarDays className="h-4 w-4" aria-hidden="true" />{entries.length} upcoming</div></header>{entries.length ? <ol>{entries.map((entry) => <li className="admin-dashboard__row grid grid-cols-[108px_minmax(0,1fr)] gap-4 border-b border-steel p-4 last:border-0 sm:grid-cols-[150px_minmax(0,1fr)] sm:px-6" key={entry.id}><time className={`font-mono text-[9px] uppercase tracking-[.11em] ${tones[entry.tone]}`} dateTime={entry.date}>{calendarDate(entry.date)}</time><div><p className="text-sm text-bone">{entry.title}</p><p className="mt-1 text-xs capitalize text-ghost">{entry.detail.replaceAll("_", " ")}</p></div></li>)}</ol> : <div className="p-8"><p className="font-mono text-[10px] uppercase tracking-[.12em] text-ghost">The field is clear</p><p className="mt-2 text-sm text-ghost">No future operating dates are scheduled.</p></div>}</section>;
}

function MorningCards({ cards }: { cards: DashboardCard[] }) {
  const tone = { good: "text-flux", attention: "text-halo", urgent: "text-plasma", quiet: "text-ghost" };
  return <section className="admin-dashboard__section"><SectionTitle eyebrow="Daily briefing" title="Morning cards" detail="The points that need a decision, a reply, or a glance." /><div className="admin-dashboard__grid mt-4 grid sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => { const Icon = iconByCard[card.icon]; return <Link className="admin-card admin-lift group p-5" href={card.href} key={card.id}><div className="flex items-center justify-between"><p className="font-mono text-[10px] uppercase tracking-[.13em] text-ghost">{card.label}</p><Icon className={`h-4 w-4 ${tone[card.tone]}`} /></div><p className={`mt-5 font-display text-4xl leading-none ${tone[card.tone]}`}>{card.value}</p><p className="mt-2 min-h-8 text-xs leading-5 text-ghost">{card.detail}</p><div className="mt-5 flex items-end justify-between gap-3"><p className={`font-mono text-[9px] uppercase tracking-[.1em] ${tone[card.tone]}`}>● {card.status}</p><ArrowUpRight className="h-3.5 w-3.5 text-flux opacity-50 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" /></div></Link>; })}</div></section>;
}

function ArmStatus({ arms }: { arms: DashboardArm[] }) {
  const color = { plasma: "border-l-plasma", flux: "border-l-flux", blue: "border-l-[#4A90D9]", halo: "border-l-halo", bone: "border-l-bone" };
  return <section className="admin-dashboard__section"><SectionTitle eyebrow="The five arms" title="The center holds." detail="Every arm has work in motion, and every signal returns to Ø." /><div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-5">{arms.map((arm) => <Link className={`admin-card admin-lift group flex min-h-56 flex-col border-l-2 ${color[arm.color]} p-5`} href={arm.href} key={arm.id}><div><p className="font-mono text-[10px] uppercase tracking-[.15em] text-bone">{arm.label}</p><p className="mt-2 text-xs leading-5 text-ghost">● {arm.description}</p></div><div className="mt-7"><p className="font-mono text-[9px] uppercase tracking-[.1em] text-flux">Active</p><p className="mt-2 text-sm leading-5 text-bone">{arm.activity}</p><p className="mt-3 text-xs leading-5 text-ghost">{arm.metric}</p></div><div className="mt-auto pt-6">{arm.alert ? <p className="font-mono text-[9px] uppercase leading-4 tracking-[.09em] text-halo">Alert · {arm.alert}</p> : <p className="font-mono text-[9px] uppercase tracking-[.09em] text-ghost">No immediate alert</p>}<p className="mt-4 inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[.12em] text-flux">Enter arm <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" /></p></div></Link>)}</div></section>;
}

function ActivityFeed({ activity }: { activity: DashboardActivity[] }) {
  const dots = { plasma: "bg-plasma", flux: "bg-flux", halo: "bg-halo", ghost: "bg-ghost" };
  return <section className="admin-panel admin-dashboard__section"><header className="border-b border-mercury px-5 py-5 sm:px-6"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-plasma">Recent activity</p><h2 className="mt-2 font-display text-3xl leading-none">The record is moving.</h2></header>{activity.length ? <div>{activity.map((item) => <Link className="admin-dashboard__row group grid grid-cols-[auto_74px_minmax(0,1fr)_auto] items-center gap-3 border-b border-steel px-4 py-4 last:border-0 sm:px-6" href={item.href} key={item.id}><span className={`h-2 w-2 rounded-full ${dots[item.tone]}`} /><span className="font-mono text-[9px] uppercase tracking-[.1em] text-ghost">{relativeTime(item.createdAt)}</span><p className="text-sm text-bone">{item.description}</p><ArrowUpRight className="h-3.5 w-3.5 text-ghost transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-flux" /></Link>)}</div> : <p className="p-6 text-sm text-ghost">No recorded activity yet. The feed will fill as work moves through the system.</p>}</section>;
}

function QuickAccess({ links }: { links: DashboardQuickLink[] }) {
  return <section className="admin-dashboard__section"><SectionTitle eyebrow="Quick access" title="Cross-arm resources" detail="The shared records that keep the whole body connected." /><div className="admin-dashboard__grid mt-4 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{links.map((link) => { const Icon = iconByQuickLink[link.icon]; return <Link className="admin-card admin-lift group p-5" href={link.href} key={link.id}><Icon className="h-4 w-4 text-flux" /><p className="mt-4 font-display text-2xl leading-none">{link.count} <span className="font-mono text-[10px] uppercase tracking-[.1em] text-ghost">{link.label}</span></p><p className="mt-2 text-xs leading-5 text-ghost">{link.context}</p></Link>; })}</div></section>;
}

function SectionTitle({ eyebrow, title, detail }: { eyebrow: string; title: string; detail: string }) {
  return <header><p className="font-mono text-[11px] uppercase tracking-[.17em] text-plasma">{eyebrow}</p><h2 className="mt-2 font-display text-3xl leading-none text-bone">{title}</h2><p className="mt-2 text-xs text-ghost">{detail}</p></header>;
}

export function OperationsDashboard({ user, liveItems, countdown, calendarEntries, cards, arms, activity, quickLinks, generatedAt }: OperationsDashboardProps) {
  return <main className="admin-dashboard relative isolate min-h-screen overflow-hidden px-5 py-[42px] text-bone sm:px-8"><div aria-hidden="true" className="pointer-events-none fixed right-[-8rem] top-28 z-0 w-72 opacity-[.045] blur-[1px] sm:right-[-4rem] sm:w-96 lg:right-8 lg:w-[30rem]"><OdinOrbitMark className="admin-orbit-mark dashboard-orbit-object h-auto w-full text-plasma" decorative /></div><LoginSplash userId={user.id} /><div className="admin-dashboard__stack relative z-10 mx-auto grid max-w-7xl"><DashboardGreeting fullName={user.fullName} lastLogin={user.lastLogin} role={user.role} /><LiveNow generatedAt={generatedAt} items={liveItems} /><CountdownClock countdown={countdown} /><OperationsCalendar entries={calendarEntries} /><MorningCards cards={cards} /><ArmStatus arms={arms} /><ActivityFeed activity={activity} /><QuickAccess links={quickLinks} /></div></main>;
}
