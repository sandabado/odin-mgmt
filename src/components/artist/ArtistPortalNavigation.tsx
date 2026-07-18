"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { type ComponentType, type SVGProps, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  Home,
  Landmark,
  ListMusic,
  LogOut,
  Menu,
  MessageCircle,
  Wrench,
  X,
} from "lucide-react";
import { BandMemberAvatar } from "@/components/artist/BandMemberAvatar";
import { useBandMember } from "@/components/artist/BandMemberContext";
import { NotificationBell } from "@/components/artist/NotificationBell";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;
type NavItem = { href: string; label: string; icon: Icon };

const navItems: NavItem[] = [
  { href: "/artist/dashboard", label: "Home", icon: Home },
  { href: "/artist/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/artist/music", label: "Music", icon: ListMusic },
  { href: "/artist/revenue", label: "Revenue", icon: Landmark },
  { href: "/artist/tools", label: "Tools", icon: Wrench },
];

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, artistId, compact = false, onNavigate }: { item: NavItem; artistId?: string | null; compact?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = isCurrent(pathname, item.href);
  const Icon = item.icon;
  const href = artistId ? `${item.href}?artist=${encodeURIComponent(artistId)}` : item.href;

  return <Link
    aria-current={active ? "page" : undefined}
    className={`group relative flex items-center gap-3 border transition ${compact ? "min-w-[76px] flex-1 flex-col border-transparent px-1 py-2 text-center" : "border-transparent px-3 py-3"} ${active ? "bg-plasma/15 text-bone" : "text-ghost hover:border-mercury hover:bg-steel hover:text-bone"}`}
    href={href}
    onClick={onNavigate}
  >
    {active && !compact ? <span className="absolute inset-y-0 left-0 w-px bg-flux" /> : null}
    <Icon aria-hidden="true" className={`${compact ? "h-4 w-4" : "h-4 w-4"} ${active ? "text-flux" : "text-ghost group-hover:text-plasma"}`} />
    <span className="font-mono text-[9px] uppercase tracking-[.11em]">{item.label}</span>
  </Link>;
}

function MemberControl() {
  const { currentBandMember, openMemberPicker } = useBandMember();
  return <button aria-label="Choose or switch band member" className="flex min-w-0 items-center gap-2 border border-mercury px-2 py-1.5 text-ghost transition hover:border-plasma hover:text-bone" onClick={openMemberPicker} type="button">
    {currentBandMember ? <BandMemberAvatar member={currentBandMember} /> : <span className="grid h-6 w-6 place-items-center rounded-full border border-dashed border-mercury font-mono text-[9px]">?</span>}
    <span className="max-w-20 truncate font-mono text-[8px] uppercase tracking-[.08em]">{currentBandMember?.display_name || currentBandMember?.name || "Who are you?"}</span>
  </button>;
}

export function ArtistPortalNavigation({ artistName, isOperations, onOpenBandChat }: { artistName?: string; isOperations: boolean; onOpenBandChat: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const searchParams = useSearchParams();
  const artistId = searchParams.get("artist");

  async function signOut() {
    await createBrowserSupabaseClient().auth.signOut();
    window.location.assign("/");
  }

  return <>
    <header className="sticky top-0 z-30 border-b border-mercury bg-void/95 px-4 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <Link className="font-display text-2xl leading-none text-bone" href="/artist/dashboard">øDIN<span className="text-plasma">/</span><span className="ml-1 text-sm text-ghost">artist</span></Link>
        <div className="flex items-center gap-2"><MemberControl /><NotificationBell /><button aria-expanded={menuOpen} aria-label={menuOpen ? "Close artist portal menu" : "Open artist portal menu"} className="border border-mercury p-2 text-ghost transition hover:border-plasma hover:text-bone" onClick={() => setMenuOpen((open) => !open)} type="button">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button></div>
      </div>
      {menuOpen ? <div className="mt-3 grid border border-mercury bg-carbon p-2"><p className="px-3 pb-2 pt-1 font-mono text-[9px] uppercase tracking-[.14em] text-ghost">{artistName || "Artist field"}</p><button className="flex items-center gap-3 border border-transparent px-3 py-3 text-left font-mono text-[9px] uppercase tracking-[.11em] text-ghost hover:border-mercury hover:text-plasma" onClick={() => { onOpenBandChat(); setMenuOpen(false); }} type="button"><MessageCircle className="h-4 w-4" />Band chat</button>{navItems.map((item) => <NavLink artistId={artistId} item={item} key={item.href} onNavigate={() => setMenuOpen(false)} />)}{isOperations ? <Link className="mt-1 flex items-center gap-3 border-t border-mercury px-3 py-3 font-mono text-[9px] uppercase tracking-[.11em] text-ghost hover:text-flux" href="/admin" onClick={() => setMenuOpen(false)}><ChevronLeft className="h-4 w-4" />Command hub</Link> : null}<button className="mt-1 flex items-center gap-3 border-t border-mercury px-3 py-3 font-mono text-[9px] uppercase tracking-[.11em] text-ghost hover:text-plasma" onClick={signOut} type="button"><LogOut className="h-4 w-4" />Sign out</button></div> : null}
    </header>
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-mercury bg-carbon lg:flex lg:flex-col">
      <div className="border-b border-mercury px-6 py-7"><Link className="font-display text-3xl leading-none text-bone" href="/artist/dashboard">øDIN<span className="text-plasma">/</span></Link><p className="mt-2 font-mono text-[9px] uppercase tracking-[.17em] text-ghost">Artist portal</p></div>
      <div className="border-b border-mercury px-6 py-5"><p className="truncate font-display text-2xl leading-none text-bone">{artistName || "Your artist field"}</p><div className="mt-4 flex items-center justify-between gap-2"><MemberControl /><NotificationBell /></div><p className="mt-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.12em] text-flux"><span className="h-1.5 w-1.5 rounded-full bg-flux shadow-[0_0_12px_rgba(0,255,194,.8)]" />Live operations</p></div>
      <nav aria-label="Artist portal" className="grid gap-1 px-3 py-5"><button className="group flex items-center gap-3 border border-transparent px-3 py-3 text-left text-ghost transition hover:border-mercury hover:bg-steel hover:text-bone" onClick={onOpenBandChat} type="button"><MessageCircle className="h-4 w-4 text-ghost group-hover:text-plasma" /><span className="font-mono text-[9px] uppercase tracking-[.11em]">Band chat</span></button>{navItems.map((item) => <NavLink artistId={artistId} item={item} key={item.href} />)}</nav>
      <div className="mt-auto border-t border-mercury p-3">{isOperations ? <Link className="flex items-center gap-3 px-3 py-3 font-mono text-[9px] uppercase tracking-[.11em] text-ghost transition hover:text-flux" href="/admin"><ChevronLeft className="h-4 w-4" />Command hub</Link> : null}<button className="flex w-full items-center gap-3 px-3 py-3 font-mono text-[9px] uppercase tracking-[.11em] text-ghost transition hover:text-plasma" onClick={signOut} type="button"><LogOut className="h-4 w-4" />Sign out</button></div>
    </aside>
    <nav aria-label="Artist portal mobile" className="fixed inset-x-0 bottom-0 z-30 flex overflow-x-auto border-t border-mercury bg-carbon/95 px-1 pb-[max(.35rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur lg:hidden">{navItems.map((item) => <NavLink artistId={artistId} compact item={item} key={item.href} />)}</nav>
  </>;
}
