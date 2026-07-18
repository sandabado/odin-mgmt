"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ComponentType, type SVGProps } from "react";
import {
  Bell, BookOpen, BriefcaseBusiness, CalendarDays, ChevronRight, CircleDot, FileText, Landmark, LogOut, MapPin, Menu, Music2, Newspaper, Repeat2, Search, Settings, Sparkles, UserRound, Users, UsersRound, WalletCards, X,
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;
type NavItem = { label: string; icon: Icon; href?: string; status?: string };
type NavSection = { label: string; items: NavItem[] };

const navigation: NavSection[] = [
  { label: "Central", items: [
    { label: "Command hub", icon: CircleDot, href: "/admin" },
    { label: "Treasury", icon: Landmark, href: "/admin/treasury" },
    { label: "Artist studios", icon: BriefcaseBusiness, href: "/admin/artists" },
  ] },
  { label: "Management", items: [
    { label: "Venues", icon: MapPin, status: "Next" },
    { label: "Artists", icon: Users, href: "/admin/artists" },
    { label: "Partner artists", icon: UsersRound, status: "Next" },
    { label: "Swap board", icon: Repeat2, status: "Next" },
  ] },
  { label: "Network", items: [
    { label: "Contacts", icon: UserRound, href: "/admin/contacts" },
    { label: "Outreach", icon: Sparkles, status: "Next" },
    { label: "Deals", icon: FileText, status: "Next" },
    { label: "Contracts", icon: FileText, status: "Next" },
  ] },
  { label: "Studio arms", items: [
    { label: "Promo studio", icon: Sparkles, status: "Next" },
    { label: "Engineering", icon: Music2, status: "Next" },
    { label: "Records", icon: WalletCards, status: "Next" },
    { label: "Press", icon: Newspaper, status: "Next" },
  ] },
  { label: "System", items: [
    { label: "Playbook", icon: BookOpen, href: "/admin/playbook" },
    { label: "Calendar", icon: CalendarDays, status: "Next" },
    { label: "Settings", icon: Settings, status: "Next" },
  ] },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return <><button aria-label="Close navigation" className={`fixed inset-0 z-30 bg-void/70 transition lg:hidden ${open ? "block" : "hidden"}`} onClick={onClose} type="button" /><aside className={`admin-sidebar fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-mercury bg-carbon transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}><div className="flex items-center justify-between border-b border-mercury p-5"><Link href="/admin" className="flex items-center gap-3" onClick={onClose}><span className="grid h-8 w-8 place-items-center bg-plasma font-display text-xl text-void">Ø</span><span><span className="block font-display text-xl leading-none text-bone">ØDIN</span><span className="mt-1 block font-mono text-[9px] uppercase tracking-[.16em] text-ghost">Management OS</span></span></Link><button aria-label="Close navigation" className="p-1 text-ghost hover:text-bone lg:hidden" onClick={onClose} type="button"><X className="h-5 w-5" /></button></div><nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">{navigation.map((section) => <section className="mb-5" key={section.label}><p className="mb-2 px-3 font-mono text-[9px] uppercase tracking-[.16em] text-ghost">{section.label}</p>{section.items.map((item) => { const active = item.href === "/admin" ? pathname === "/admin" : Boolean(item.href && pathname.startsWith(item.href)); const IconComponent = item.icon; const content = <><IconComponent className="h-4 w-4 shrink-0" /><span>{item.label}</span>{active ? <ChevronRight className="ml-auto h-3 w-3 opacity-60" /> : item.status ? <span className="ml-auto font-mono text-[8px] uppercase tracking-[.1em] text-ghost">{item.status}</span> : null}</>; const className = `mb-1 flex items-center gap-3 border-l-2 px-3 py-2.5 font-mono text-[10px] uppercase tracking-[.08em] transition ${active ? "border-plasma bg-steel text-plasma" : item.href ? "border-transparent text-ghost hover:bg-steel hover:text-bone" : "cursor-not-allowed border-transparent text-ghost/50"}`; return item.href ? <Link className={className} href={item.href} key={item.label} onClick={onClose}>{content}</Link> : <div aria-disabled="true" className={className} key={item.label}>{content}</div>; })}</section>)}</nav><div className="border-t border-mercury p-4"><div className="flex items-center gap-2"><span className="h-2 w-2 bg-flux shadow-[0_0_9px_rgba(0,255,194,.75)]" /><span className="font-mono text-[9px] uppercase tracking-[.15em] text-ghost">System online</span></div></div></aside></>;
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "signing-out" | "error">("idle");

  async function signOut() {
    setState("signing-out");
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/login");
      router.refresh();
    } catch {
      setState("error");
    }
  }

  return <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-mercury bg-carbon/95 px-4 backdrop-blur sm:px-6"><div className="flex min-w-0 flex-1 items-center gap-3"><button aria-label="Open navigation" className="p-1 text-ghost hover:text-bone lg:hidden" onClick={onMenu} type="button"><Menu className="h-5 w-5" /></button><div className="relative hidden max-w-md flex-1 sm:block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ghost" /><input aria-label="Global search" className="w-full border border-mercury bg-steel py-2 pl-9 pr-3 font-mono text-xs text-bone outline-none placeholder:text-ghost focus:border-plasma" disabled placeholder="Search field preparing…" /></div></div><div className="flex items-center gap-2 sm:gap-4"><button aria-label="Notifications" className="relative p-2 text-ghost transition hover:bg-steel hover:text-bone" type="button"><Bell className="h-4 w-4" /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 bg-plasma" /></button><div className="hidden border-l border-mercury pl-4 sm:block"><p className="font-mono text-[10px] uppercase tracking-[.1em] text-bone">Authenticated field</p><p className="mt-0.5 font-mono text-[8px] uppercase tracking-[.12em] text-ghost">Odin operations</p></div><button aria-label="Sign out" className="p-2 text-ghost transition hover:bg-steel hover:text-bone disabled:opacity-50" disabled={state === "signing-out"} onClick={signOut} type="button"><LogOut className="h-4 w-4" /></button>{state === "error" ? <span className="sr-only">Unable to sign out. Try again.</span> : null}</div></header>;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [navigationOpen, setNavigationOpen] = useState(false);

  return <div className="admin-shell min-h-screen bg-void text-bone"><div className="admin-scanlines pointer-events-none fixed inset-0 z-50" /><Sidebar open={navigationOpen} onClose={() => setNavigationOpen(false)} /><div className="min-h-screen lg:pl-64"><TopBar onMenu={() => setNavigationOpen(true)} />{children}</div></div>;
}
