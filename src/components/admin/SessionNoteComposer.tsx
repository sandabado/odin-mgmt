"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function SessionNoteComposer({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("saving"); setMessage("");
    const data = new FormData(event.currentTarget);
    const response = await fetch(`/api/engineering/sessions/${sessionId}/notes`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: data.get("title"), content: data.get("content"), important: data.get("important") === "on", requiresResponse: data.get("requiresResponse") === "on" }) });
    const payload = await response.json().catch(() => null);
    if (!response.ok) { setState("error"); setMessage(payload?.error?.message || "Unable to save note."); return; }
    event.currentTarget.reset(); setState("idle"); setMessage("Note added to the session record."); router.refresh();
  }
  return <form className="mt-5 border border-steel bg-void/60 p-4" onSubmit={submit}><p className="font-mono text-[9px] uppercase tracking-[.14em] text-flux">New note</p><input className="mt-3 w-full border border-mercury bg-carbon p-3 text-sm text-bone" maxLength={180} name="title" placeholder="Subject (optional)" /><textarea className="mt-2 min-h-28 w-full border border-mercury bg-carbon p-3 text-sm text-bone" maxLength={10000} name="content" placeholder="Creative direction, reference, question, or delivery note…" required /><div className="mt-3 flex flex-wrap items-center gap-4 font-mono text-[9px] uppercase tracking-[.1em] text-ghost"><label className="flex items-center gap-2"><input name="important" type="checkbox" /> Important</label><label className="flex items-center gap-2"><input name="requiresResponse" type="checkbox" /> Requires response</label><button className="ml-auto border border-flux px-3 py-2 text-flux hover:bg-flux hover:text-void disabled:opacity-50" disabled={state === "saving"} type="submit">{state === "saving" ? "Sending…" : "Send note →"}</button></div>{message ? <p className={`mt-3 font-mono text-[9px] uppercase tracking-[.1em] ${state === "error" ? "text-red-300" : "text-flux"}`}>{message}</p> : null}</form>;
}
