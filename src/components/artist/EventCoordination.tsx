"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import { AttendanceSummary } from "@/components/artist/AttendanceSummary";
import { EventThread } from "@/components/artist/EventThread";
import { RsvpButtons } from "@/components/artist/RsvpButtons";
import type { BandMember, EventMessage, EventReference, EventRsvp, EventThreadRecord } from "@/components/artist/band-types";
import { eventColumn } from "@/components/artist/band-types";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function EventCoordination({ event, members, initialRsvps, thread, initialMessages, initialChatOpen = false }: { event: EventReference; members: BandMember[]; initialRsvps: EventRsvp[]; thread: EventThreadRecord | null; initialMessages: EventMessage[]; initialChatOpen?: boolean }) {
  const [rsvps, setRsvps] = useState<EventRsvp[]>(initialRsvps);
  const [chatOpen, setChatOpen] = useState(initialChatOpen);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    setRsvps(initialRsvps);
  }, [initialRsvps]);

  useEffect(() => {
    const channel = supabase.channel(`event-rsvps:${event.type}:${event.id}`).on("postgres_changes", { event: "*", schema: "public", table: "event_rsvps", filter: `${eventColumn(event.type)}=eq.${event.id}` }, (payload) => {
      if (payload.eventType === "DELETE") {
        const previous = payload.old as Pick<EventRsvp, "id">;
        setRsvps((current) => current.filter((rsvp) => rsvp.id !== previous.id));
        return;
      }
      const incoming = payload.new as EventRsvp;
      setRsvps((current) => current.some((rsvp) => rsvp.id === incoming.id) ? current.map((rsvp) => rsvp.id === incoming.id ? incoming : rsvp) : [...current, incoming]);
    }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [event.id, event.type, supabase]);

  function updateRsvp(next: EventRsvp) {
    setRsvps((current) => current.some((rsvp) => rsvp.id === next.id) ? current.map((rsvp) => rsvp.id === next.id ? next : rsvp) : [...current, next]);
  }

  return <section className="mt-4 grid gap-3 border-t border-steel pt-4">
    <AttendanceSummary members={members} rsvps={rsvps} />
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start"><RsvpButtons event={event} onChange={updateRsvp} rsvps={rsvps} /><button className="inline-flex items-center justify-center gap-2 border border-mercury px-4 py-3 font-mono text-[9px] uppercase tracking-[.1em] text-ghost transition hover:border-plasma hover:text-plasma" onClick={() => setChatOpen((open) => !open)} type="button"><MessageCircle className="h-4 w-4" />{chatOpen ? "Hide chat" : thread ? "Open chat" : "Chat preparing"}</button></div>
    {chatOpen && thread ? <EventThread initialMessages={initialMessages} members={members} thread={thread} /> : null}
  </section>;
}
