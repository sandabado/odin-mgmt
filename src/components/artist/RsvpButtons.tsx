"use client";

import { useState } from "react";
import { useBandMember } from "@/components/artist/BandMemberContext";
import type { EventReference, EventRsvp } from "@/components/artist/band-types";
import { eventColumn } from "@/components/artist/band-types";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type Response = EventRsvp["response"];

export function RsvpButtons({ event, rsvps, onChange }: { event: EventReference; rsvps: EventRsvp[]; onChange: (rsvp: EventRsvp) => void }) {
  const { currentBandMember, openMemberPicker } = useBandMember();
  const [note, setNote] = useState("");
  const [lateArrival, setLateArrival] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const currentRsvp = currentBandMember ? rsvps.find((rsvp) => rsvp.band_member_id === currentBandMember.id) : null;

  async function submit(response: Response) {
    if (!currentBandMember) {
      openMemberPicker();
      return;
    }
    setState("saving");
    const supabase = createBrowserSupabaseClient();
    const payload = {
      event_type: event.type,
      band_member_id: currentBandMember.id,
      response,
      late_arrival_time: response === "late" ? lateArrival || null : null,
      note: note || null,
      responded_at: new Date().toISOString(),
      [eventColumn(event.type)]: event.id,
    };
    const request = currentRsvp
      ? supabase.from("event_rsvps").update(payload).eq("id", currentRsvp.id).select().single<EventRsvp>()
      : supabase.from("event_rsvps").insert(payload).select().single<EventRsvp>();
    const { data, error } = await request;
    if (error || !data) {
      setState("error");
      return;
    }
    onChange(data);
    setState("idle");
  }

  return <div className="border border-steel bg-carbon p-3">
    <p className="font-mono text-[8px] uppercase tracking-[.13em] text-ghost">{currentBandMember ? `RSVP as ${currentBandMember.display_name || currentBandMember.name}` : "Choose who is responding"}</p>
    <div className="mt-3 grid grid-cols-3 gap-2">
      <button className={`border px-2 py-2 font-mono text-[9px] uppercase tracking-[.08em] transition ${currentRsvp?.response === "confirmed" ? "border-flux bg-flux/15 text-flux" : "border-mercury text-ghost hover:border-flux hover:text-flux"}`} disabled={state === "saving"} onClick={() => submit("confirmed")} type="button">✓ In</button>
      <button className={`border px-2 py-2 font-mono text-[9px] uppercase tracking-[.08em] transition ${currentRsvp?.response === "tentative" ? "border-halo bg-halo/10 text-halo" : "border-mercury text-ghost hover:border-halo hover:text-halo"}`} disabled={state === "saving"} onClick={() => submit("tentative")} type="button">? Maybe</button>
      <button className={`border px-2 py-2 font-mono text-[9px] uppercase tracking-[.08em] transition ${currentRsvp?.response === "declined" ? "border-red-300 bg-red-300/10 text-red-300" : "border-mercury text-ghost hover:border-red-300 hover:text-red-300"}`} disabled={state === "saving"} onClick={() => submit("declined")} type="button">× Out</button>
    </div>
    <div className="mt-2 grid gap-2 sm:grid-cols-[110px_1fr_auto]">
      <input aria-label="Late arrival time" className="border border-mercury bg-void px-2 py-2 text-xs text-bone outline-none placeholder:text-ghost focus:border-plasma" onChange={(input) => setLateArrival(input.target.value)} placeholder="Late? 7:30" value={lateArrival} />
      <input aria-label="RSVP note" className="border border-mercury bg-void px-2 py-2 text-xs text-bone outline-none placeholder:text-ghost focus:border-plasma" onChange={(input) => setNote(input.target.value)} placeholder="Optional note to the band" value={note} />
      <button className="border border-plasma px-2 py-2 font-mono text-[8px] uppercase tracking-[.08em] text-plasma transition hover:bg-plasma hover:text-void" disabled={state === "saving"} onClick={() => submit("late")} type="button">Late</button>
    </div>
    {state === "error" ? <p className="mt-2 text-xs text-red-300">Your RSVP did not save. Try again.</p> : null}
  </div>;
}
