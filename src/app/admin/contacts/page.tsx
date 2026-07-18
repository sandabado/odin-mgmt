import Link from "next/link";
import { redirect } from "next/navigation";
import { ContactWarmthMeter } from "@/components/admin/ContactWarmthMeter";
import { FieldFilters } from "@/components/admin/FieldFilters";
import { hasSupabaseEnvironment } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Contact = {
  id: string;
  name: string;
  company: string | null;
  category: string;
  email: string | null;
  location: string | null;
  region: string | null;
  genre_focus: string[];
  warmth_score: number;
  last_contact_date: string | null;
  next_outreach: string | null;
};

const regions = [{ label: "Desert", value: "desert" }, { label: "Los Angeles", value: "los_angeles" }, { label: "San Diego", value: "san_diego" }] as const;
const categories = [{ label: "Bookers", value: "booker" }, { label: "Sync", value: "sync_agent" }, { label: "Managers", value: "manager" }, { label: "Promoters", value: "promoter" }] as const;
const dateLabel = (date: string | null) => date ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00`)) : "Not yet";

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ region?: string; category?: string }> }) {
  const { region, category } = await searchParams;
  const activeRegion = regions.some((item) => item.value === region) ? region : undefined;
  const activeCategory = categories.some((item) => item.value === category) ? category : undefined;

  if (!hasSupabaseEnvironment()) {
    return <main className="min-h-screen bg-void p-6 text-bone sm:p-10"><section className="mx-auto max-w-3xl border border-mercury bg-carbon p-7 sm:p-10"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-plasma">Ødin Network / configuration required</p><h1 className="mt-5 font-display text-5xl leading-none">Build the Rolodex.</h1><p className="mt-6 max-w-xl text-sm leading-6 text-ghost">The protected contacts workspace is ready. Connect Supabase and apply the network migration to begin logging real relationships.</p></section></main>;
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/contacts");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "super_admin" && profile?.role !== "booking_director") redirect("/admin");

  let contactQuery = supabase.from("contacts").select("id, name, company, category, email, location, region, genre_focus, warmth_score, last_contact_date, next_outreach").order("warmth_score", { ascending: false });
  if (activeRegion) contactQuery = contactQuery.eq("region", activeRegion);
  if (activeCategory) contactQuery = contactQuery.eq("category", activeCategory);
  const { data, error } = await contactQuery.returns<Contact[]>();
  const contacts = data ?? [];

  return <main className="min-h-screen bg-void px-5 py-8 text-bone sm:px-8"><div className="mx-auto max-w-7xl"><header className="flex flex-wrap items-end justify-between gap-5 border-b border-mercury pb-6"><div><Link className="font-mono text-[10px] uppercase tracking-[.16em] text-ghost transition hover:text-flux" href="/admin">← Operations</Link><p className="mt-5 font-mono text-[10px] uppercase tracking-[.18em] text-plasma">Ødin Network / industry Rolodex</p><h1 className="mt-3 font-display text-5xl leading-none">Relationships, held close.</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-ghost">Every connection, its context, and the next move—kept in one private field.</p></div><a className="border border-flux px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[.14em] text-flux transition hover:bg-flux hover:text-void" href="mailto:booking@odin.management?subject=New%20Odin%20Network%20contact">+ Add contact</a></header><div className="mt-5 grid gap-3"><FieldFilters active={activeRegion} label="Market" options={[...regions]} param="region" values={{ region: activeRegion, category: activeCategory }} /><FieldFilters active={activeCategory} label="Role" options={[...categories]} param="category" values={{ region: activeRegion, category: activeCategory }} /></div><section className="mt-5 flex flex-wrap items-center justify-between gap-4 border border-mercury bg-carbon px-5 py-4"><div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[.12em] text-ghost"><span className="border border-steel px-3 py-2 text-bone">{contacts.length} contacts</span><span className="border border-steel px-3 py-2">Warmth order</span></div><p className="font-mono text-[10px] uppercase tracking-[.12em] text-ghost">{error ? "Unable to load contacts" : "Live relationship field"}</p></section>{contacts.length ? <section className="mt-4 grid gap-3">{contacts.map((contact) => <article className="grid gap-5 border border-mercury bg-carbon p-5 transition hover:border-plasma sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center" key={contact.id}><div><div className="flex flex-wrap items-center gap-3"><h2 className="font-display text-3xl leading-none">{contact.name}</h2><span className="border border-steel px-2 py-1 font-mono text-[9px] uppercase tracking-[.12em] text-ghost">{contact.category.replaceAll("_", " ")}</span></div><p className="mt-2 text-sm text-ghost">{contact.company || "Independent"} · {contact.location || contact.region?.replaceAll("_", " ") || "Location pending"}</p><p className="mt-3 text-xs text-ghost">{contact.genre_focus.length ? contact.genre_focus.join(" · ") : "Genre focus pending"}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[.1em] text-ghost"><span>Last {dateLabel(contact.last_contact_date)}</span><span>Next {dateLabel(contact.next_outreach)}</span>{contact.email ? <a className="text-flux hover:text-bone" href={`mailto:${contact.email}`}>Email ↗</a> : <span>Email pending</span>}</div></div><ContactWarmthMeter score={contact.warmth_score} /></article>)}</section> : <section className="mt-4 border border-dashed border-steel bg-carbon p-8 sm:p-12"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-plasma">No matching relationships</p><h2 className="mt-4 font-display text-4xl leading-none">This filter is quiet.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-ghost">Clear one or both filters to return to the full relationship field.</p></section>}</div></main>;
}
