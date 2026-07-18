"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type ProjectOption = { id: string; title: string };

export function StudioSessionForm({ artistId, projects }: { artistId: string; projects: ProjectOption[] }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/studios/${artistId}/sessions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        projectId: form.get("projectId"),
        sessionDate: form.get("sessionDate"),
        engineerName: form.get("engineerName"),
        hours: form.get("hours"),
        costCents: Math.round(Number(form.get("costDollars")) * 100),
        notes: form.get("notes"),
      }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setState("error");
      setMessage(payload?.error?.message || "Unable to save the session.");
      return;
    }
    event.currentTarget.reset();
    setState("idle");
    setMessage("Session logged in recording.");
    router.refresh();
  }

  if (!projects.length) return <p className="mt-4 font-mono text-[10px] uppercase tracking-[.1em] text-ghost">Create a project before logging a session.</p>;

  return <details className="mt-5 border border-steel bg-void/60 p-4"><summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[.14em] text-flux">+ Log studio session</summary><form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={submit}><label className="grid gap-1 font-mono text-[9px] uppercase tracking-[.12em] text-ghost">Project<select className="border border-mercury bg-carbon p-2 text-xs text-bone" name="projectId" required>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select></label><label className="grid gap-1 font-mono text-[9px] uppercase tracking-[.12em] text-ghost">Date<input className="border border-mercury bg-carbon p-2 text-xs text-bone" name="sessionDate" required type="date" /></label><label className="grid gap-1 font-mono text-[9px] uppercase tracking-[.12em] text-ghost">Engineer<input className="border border-mercury bg-carbon p-2 text-xs text-bone" name="engineerName" required /></label><label className="grid gap-1 font-mono text-[9px] uppercase tracking-[.12em] text-ghost">Hours<input className="border border-mercury bg-carbon p-2 text-xs text-bone" defaultValue="2" min="0.25" name="hours" required step="0.25" type="number" /></label><label className="grid gap-1 font-mono text-[9px] uppercase tracking-[.12em] text-ghost">Cost (USD)<input className="border border-mercury bg-carbon p-2 text-xs text-bone" defaultValue="0" min="0" name="costDollars" required step="0.01" type="number" /></label><label className="grid gap-1 font-mono text-[9px] uppercase tracking-[.12em] text-ghost">Notes<input className="border border-mercury bg-carbon p-2 text-xs text-bone" maxLength={5000} name="notes" /></label><div className="sm:col-span-2 flex flex-wrap items-center gap-3"><button className="border border-flux px-3 py-2 font-mono text-[9px] uppercase tracking-[.12em] text-flux transition hover:bg-flux hover:text-void disabled:opacity-50" disabled={state === "saving"} type="submit">{state === "saving" ? "Logging…" : "Save session"}</button>{message ? <p className={`font-mono text-[9px] uppercase tracking-[.1em] ${state === "error" ? "text-red-300" : "text-flux"}`}>{message}</p> : null}</div></form></details>;
}
