"use client";

import { FormEvent, useState } from "react";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type SetlistOption = { id: string; name: string };

export function PracticeQuickAdd({ artistId, setlists }: { artistId: string; setlists: SetlistOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const today = new Date().toISOString().slice(0, 10);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    const form = new FormData(event.currentTarget);
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const setlistId = String(form.get("setlist_id") || "");
    const { error } = await supabase.from("practices").insert({
      artist_id: artistId,
      created_by: user?.id ?? null,
      title: String(form.get("title") || "Practice"),
      practice_date: String(form.get("practice_date")),
      start_time: String(form.get("start_time")),
      end_time: String(form.get("end_time")),
      location: String(form.get("location") || "Studio"),
      focus_type: String(form.get("focus_type") || "general"),
      setlist_id: setlistId || null,
      notes: String(form.get("notes") || "") || null,
      status: "scheduled",
    });
    if (error) {
      setState("error");
      return;
    }
    setOpen(false);
    setState("idle");
    router.refresh();
  }

  return <div className="fixed bottom-20 right-4 z-20 sm:bottom-6 sm:right-6"><button aria-expanded={open} className="inline-flex items-center gap-2 border border-flux bg-void px-4 py-3 font-mono text-[9px] uppercase tracking-[.13em] text-flux shadow-[0_0_25px_rgba(0,255,194,.12)] transition hover:bg-flux hover:text-void" onClick={() => setOpen(true)} type="button"><Plus className="h-4 w-4" />Add practice</button>{open ? <div className="fixed inset-0 z-30 grid place-items-end bg-void/75 p-4 backdrop-blur-sm sm:place-items-center"><form className="w-full max-w-lg border border-mercury bg-carbon p-5 shadow-2xl sm:p-6" onSubmit={submit}><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[9px] uppercase tracking-[.15em] text-plasma">Band operations</p><h2 className="mt-2 font-display text-3xl leading-none">Schedule a practice.</h2></div><button aria-label="Close practice form" className="border border-steel p-2 text-ghost hover:text-bone" onClick={() => setOpen(false)} type="button"><X className="h-4 w-4" /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="grid gap-2 font-mono text-[8px] uppercase tracking-[.12em] text-ghost sm:col-span-2">Title<input className="border border-mercury bg-void px-3 py-2.5 text-sm normal-case tracking-normal text-bone outline-none focus:border-plasma" defaultValue="Practice" name="title" required /></label><label className="grid gap-2 font-mono text-[8px] uppercase tracking-[.12em] text-ghost">Date<input className="border border-mercury bg-void px-3 py-2.5 text-sm normal-case tracking-normal text-bone outline-none focus:border-plasma" defaultValue={today} name="practice_date" required type="date" /></label><label className="grid gap-2 font-mono text-[8px] uppercase tracking-[.12em] text-ghost">Focus<select className="border border-mercury bg-void px-3 py-2.5 text-sm normal-case tracking-normal text-bone outline-none focus:border-plasma" defaultValue="general" name="focus_type"><option value="general">General</option><option value="full_set">Full set</option><option value="pre_show_prep">Pre-show prep</option><option value="new_material">New material</option><option value="specific_songs">Specific songs</option><option value="songwriting">Songwriting</option><option value="recording_prep">Recording prep</option></select></label><label className="grid gap-2 font-mono text-[8px] uppercase tracking-[.12em] text-ghost">Start<input className="border border-mercury bg-void px-3 py-2.5 text-sm normal-case tracking-normal text-bone outline-none focus:border-plasma" defaultValue="19:00" name="start_time" required type="time" /></label><label className="grid gap-2 font-mono text-[8px] uppercase tracking-[.12em] text-ghost">End<input className="border border-mercury bg-void px-3 py-2.5 text-sm normal-case tracking-normal text-bone outline-none focus:border-plasma" defaultValue="21:00" name="end_time" required type="time" /></label><label className="grid gap-2 font-mono text-[8px] uppercase tracking-[.12em] text-ghost sm:col-span-2">Location<input className="border border-mercury bg-void px-3 py-2.5 text-sm normal-case tracking-normal text-bone outline-none focus:border-plasma" defaultValue="Studio" name="location" required /></label><label className="grid gap-2 font-mono text-[8px] uppercase tracking-[.12em] text-ghost sm:col-span-2">Linked setlist<select className="border border-mercury bg-void px-3 py-2.5 text-sm normal-case tracking-normal text-bone outline-none focus:border-plasma" defaultValue="" name="setlist_id"><option value="">No setlist yet</option>{setlists.map((setlist) => <option key={setlist.id} value={setlist.id}>{setlist.name}</option>)}</select></label><label className="grid gap-2 font-mono text-[8px] uppercase tracking-[.12em] text-ghost sm:col-span-2">Notes<textarea className="min-h-20 border border-mercury bg-void px-3 py-2.5 text-sm normal-case tracking-normal text-bone outline-none focus:border-plasma" name="notes" placeholder="What needs focus in the room?" /></label></div>{state === "error" ? <p className="mt-4 text-xs text-red-300">Couldn&apos;t schedule that practice. Check the details and try again.</p> : null}<div className="mt-5 flex justify-end gap-3"><button className="px-3 py-2 font-mono text-[9px] uppercase tracking-[.12em] text-ghost hover:text-bone" onClick={() => setOpen(false)} type="button">Cancel</button><button className="border border-flux bg-flux px-4 py-2.5 font-mono text-[9px] uppercase tracking-[.12em] text-void transition hover:bg-transparent hover:text-flux disabled:opacity-60" disabled={state === "saving"} type="submit">{state === "saving" ? "Scheduling…" : "Schedule practice"}</button></div></form></div> : null}</div>;
}
