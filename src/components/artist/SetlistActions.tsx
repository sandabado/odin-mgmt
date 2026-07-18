"use client";

import { FormEvent, useState } from "react";
import { ListPlus, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type Mode = "idle" | "new-setlist" | "new-song";

export function SetlistActions({ artistId, nextPosition, setlistId, showNew = true }: { artistId: string; nextPosition: number; setlistId?: string; showNew?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("idle");
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");

  function close() { setMode("idle"); setState("idle"); }

  async function createSetlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    const form = new FormData(event.currentTarget);
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("setlists").insert({ artist_id: artistId, created_by: user?.id ?? null, name: String(form.get("name")), description: String(form.get("description") || "") || null, target_duration_minutes: Number(form.get("duration") || 45), status: "draft" }).select("id").single();
    if (error || !data) { setState("error"); return; }
    router.push(`/artist/setlists?artist=${encodeURIComponent(artistId)}&setlist=${data.id}`);
    close();
  }

  async function addSong(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!setlistId) return;
    setState("saving");
    const form = new FormData(event.currentTarget);
    const seconds = Number(form.get("duration_seconds") || 0);
    const { error } = await createBrowserSupabaseClient().from("setlist_items").insert({ setlist_id: setlistId, position: nextPosition, song_title: String(form.get("song_title")), song_key: String(form.get("song_key") || "") || null, tempo_bpm: Number(form.get("tempo_bpm") || 0) || null, duration_seconds: seconds || null, notes: String(form.get("notes") || "") || null });
    if (error) { setState("error"); return; }
    router.refresh();
    close();
  }

  const addingSetlist = mode === "new-setlist";
  return <><div className="mt-5 flex flex-wrap gap-2">{showNew ? <button className="inline-flex items-center gap-2 border border-flux px-3 py-2 font-mono text-[8px] uppercase tracking-[.12em] text-flux transition hover:bg-flux hover:text-void" onClick={() => setMode("new-setlist")} type="button"><Plus className="h-3.5 w-3.5" />New setlist</button> : null}{setlistId ? <button className="inline-flex items-center gap-2 border border-mercury px-3 py-2 font-mono text-[8px] uppercase tracking-[.12em] text-ghost transition hover:border-plasma hover:text-bone" onClick={() => setMode("new-song")} type="button"><ListPlus className="h-3.5 w-3.5" />Add song</button> : null}</div>{mode !== "idle" ? <div className="fixed inset-0 z-40 grid place-items-end bg-void/75 p-4 backdrop-blur-sm sm:place-items-center"><form className="w-full max-w-md border border-mercury bg-carbon p-5" onSubmit={addingSetlist ? createSetlist : addSong}><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[9px] uppercase tracking-[.15em] text-plasma">Performance architecture</p><h2 className="mt-2 font-display text-3xl leading-none">{addingSetlist ? "Start a set." : "Add a song."}</h2></div><button aria-label="Close setlist form" className="border border-steel p-2 text-ghost hover:text-bone" onClick={close} type="button"><X className="h-4 w-4" /></button></div>{addingSetlist ? <div className="mt-5 grid gap-3"><label className="grid gap-2 font-mono text-[8px] uppercase tracking-[.12em] text-ghost">Setlist name<input autoFocus className="border border-mercury bg-void px-3 py-2.5 text-sm normal-case tracking-normal text-bone outline-none focus:border-plasma" name="name" placeholder="Standard 45 minute set" required /></label><label className="grid gap-2 font-mono text-[8px] uppercase tracking-[.12em] text-ghost">Target minutes<input className="border border-mercury bg-void px-3 py-2.5 text-sm normal-case tracking-normal text-bone outline-none focus:border-plasma" defaultValue="45" min="1" name="duration" type="number" /></label><label className="grid gap-2 font-mono text-[8px] uppercase tracking-[.12em] text-ghost">Notes<textarea className="min-h-20 border border-mercury bg-void px-3 py-2.5 text-sm normal-case tracking-normal text-bone outline-none focus:border-plasma" name="description" placeholder="Where will this set be used?" /></label></div> : <div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="grid gap-2 font-mono text-[8px] uppercase tracking-[.12em] text-ghost sm:col-span-2">Song title<input autoFocus className="border border-mercury bg-void px-3 py-2.5 text-sm normal-case tracking-normal text-bone outline-none focus:border-plasma" name="song_title" required /></label><label className="grid gap-2 font-mono text-[8px] uppercase tracking-[.12em] text-ghost">Key<input className="border border-mercury bg-void px-3 py-2.5 text-sm normal-case tracking-normal text-bone outline-none focus:border-plasma" name="song_key" placeholder="Am" /></label><label className="grid gap-2 font-mono text-[8px] uppercase tracking-[.12em] text-ghost">Tempo BPM<input className="border border-mercury bg-void px-3 py-2.5 text-sm normal-case tracking-normal text-bone outline-none focus:border-plasma" min="1" name="tempo_bpm" type="number" /></label><label className="grid gap-2 font-mono text-[8px] uppercase tracking-[.12em] text-ghost sm:col-span-2">Duration seconds<input className="border border-mercury bg-void px-3 py-2.5 text-sm normal-case tracking-normal text-bone outline-none focus:border-plasma" min="1" name="duration_seconds" placeholder="220" type="number" /></label><label className="grid gap-2 font-mono text-[8px] uppercase tracking-[.12em] text-ghost sm:col-span-2">Performance note<textarea className="min-h-20 border border-mercury bg-void px-3 py-2.5 text-sm normal-case tracking-normal text-bone outline-none focus:border-plasma" name="notes" placeholder="Transition, instrumentation, or cue" /></label></div>}{state === "error" ? <p className="mt-4 text-xs text-red-300">Couldn&apos;t save that. Check the details and try again.</p> : null}<div className="mt-5 flex justify-end gap-3"><button className="px-3 py-2 font-mono text-[9px] uppercase tracking-[.12em] text-ghost hover:text-bone" onClick={close} type="button">Cancel</button><button className="border border-flux bg-flux px-4 py-2.5 font-mono text-[9px] uppercase tracking-[.12em] text-void transition hover:bg-transparent hover:text-flux disabled:opacity-60" disabled={state === "saving"} type="submit">{state === "saving" ? "Saving…" : addingSetlist ? "Create setlist" : "Add song"}</button></div></form></div> : null}</>;
}
