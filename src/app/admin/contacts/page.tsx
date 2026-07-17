import { redirect } from "next/navigation";
import { ContactWarmthMeter } from "@/components/admin/ContactWarmthMeter";
import { hasSupabaseEnvironment } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ContactListItem = {
  id: string;
  name: string;
  company: string | null;
  category: string;
  email: string;
  location: string | null;
  genre_focus: string[];
  warmth_score: number;
  last_contact_date: string | null;
  next_outreach: string | null;
};

function dateLabel(date: string | null) {
  return date ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00`)) : "Not yet";
}

export default async function ContactsPage() {
  if (!hasSupabaseEnvironment()) {
    return <main className="min-h-screen bg-void p-6 text-bone sm:p-10"><section className="mx-auto max-w-3xl border border-mercury bg-carbon p-7 sm:p-10"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-plasma">Odin Network / configuration required</p><h1 className="mt-5 font-display text-5xl leading-none">Build the Rolodex.</h1><p className="mt-6 max-w-xl text-sm leading-6 text-ghost">The protected contacts workspace is ready. Connect Supabase and apply the Phase 1 migration followed by the Odin Network migration to begin logging real relationships.</p></section></main>;
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/contacts");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "super_admin" && profile?.role !== "booking_director") redirect("/admin");

  const { data, error } = await supabase
    .from("contacts")
    .select("id, name, company, category, email, location, genre_focus, warmth_score, last_contact_date, next_outreach")
    .order("warmth_score", { ascending: false })
    .returns<ContactListItem[]>();

  const contacts = data ?? [];
  return <main className="min-h-screen bg-void px-5 py-8 text-bone sm:px-8"><div className="mx-auto max-w-7xl"><header className="flex flex-wrap items-end justify-between gap-5 border-b border-mercury pb-6"><div><a href="/admin" className="font-mono text-[10px] uppercase tracking-[.16em] text-ghost transition hover:text-flux">← Operations</a><p className="mt-5 font-mono text-[10px] uppercase tracking-[.18em] text-plasma">Odin Network / industry Rolodex</p><h1 className="mt-3 font-display text-5xl leading-none">Relationships, held close.</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-ghost">Every connection, its context, and the next move—kept in one private field.</p></div><a href="mailto:booking@odin.management?subject=New%20Odin%20Network%20contact" className="border border-flux px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[.14em] text-flux transition hover:bg-flux hover:text-void">+ Add contact</a></header><section className="mt-7 flex flex-wrap items-center justify-between gap-4 border border-mercury bg-carbon px-5 py-4"><div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[.12em] text-ghost"><span className="border border-steel px-3 py-2 text-bone">All contacts · {contacts.length}</span><span className="border border-steel px-3 py-2">Table view</span><span className="border border-steel px-3 py-2">Warmth order</span></div><p className="font-mono text-[10px] uppercase tracking-[.12em] text-ghost">{error ? "Unable to load contacts" : "Live relationship field"}</p></section>{contacts.length ? <section className="mt-4 grid gap-3">{contacts.map((contact) => <article className="grid gap-5 border border-mercury bg-carbon p-5 transition hover:border-plasma sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center" key={contact.id}><div><div className="flex flex-wrap items-center gap-3"><h2 className="font-display text-3xl leading-none">{contact.name}</h2><span className="border border-steel px-2 py-1 font-mono text-[9px] uppercase tracking-[.12em] text-ghost">{contact.category.replaceAll("_", " ")}</span></div><p className="mt-2 text-sm text-ghost">{contact.company || "Independent"} · {contact.location || "Location pending"}</p><p className="mt-3 text-xs text-ghost">{contact.genre_focus.length ? contact.genre_focus.join(" · ") : "Genre focus pending"}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[.1em] text-ghost"><span>Last {dateLabel(contact.last_contact_date)}</span><span>Next {dateLabel(contact.next_outreach)}</span><a className="text-flux hover:text-bone" href={`mailto:${contact.email}`}>Email ↗</a></div></div><ContactWarmthMeter score={contact.warmth_score} /></article>)}</section> : <section className="mt-4 border border-dashed border-steel bg-carbon p-8 sm:p-12"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-plasma">The network starts here</p><h2 className="mt-4 font-display text-4xl leading-none">No contacts in the field yet.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-ghost">Add the first collaborator, venue connection, or sync contact once the database is connected. Odin will carry their context forward from there.</p></section>}</div></main>;
}
