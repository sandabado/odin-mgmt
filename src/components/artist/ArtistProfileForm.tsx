"use client";

import { FormEvent, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function ArtistProfileForm({ initialName, profileId }: { initialName: string; profileId: string }) {
  const [name, setName] = useState(initialName);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    const { error } = await createBrowserSupabaseClient().from("profiles").update({ full_name: name.trim() || null }).eq("id", profileId);
    setState(error ? "error" : "saved");
  }

  return <form className="mt-5 grid gap-4" onSubmit={save}>
    <label className="grid gap-2 font-mono text-[9px] uppercase tracking-[.12em] text-ghost">Display name
      <input className="border border-mercury bg-void px-3 py-3 text-sm normal-case tracking-normal text-bone outline-none transition focus:border-plasma" onChange={(event) => { setName(event.target.value); setState("idle"); }} value={name} />
    </label>
    <div className="flex flex-wrap items-center gap-3"><button className="border border-flux px-4 py-2.5 font-mono text-[9px] uppercase tracking-[.12em] text-flux transition hover:bg-flux hover:text-void disabled:opacity-60" disabled={state === "saving"} type="submit">{state === "saving" ? "Saving…" : "Save name"}</button>{state === "saved" ? <p className="text-xs text-flux">Saved to your private profile.</p> : null}{state === "error" ? <p className="text-xs text-red-300">Couldn&apos;t save that name. Try again.</p> : null}</div>
  </form>;
}
