"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Send, SmilePlus } from "lucide-react";
import { BandMemberAvatar } from "@/components/artist/BandMemberAvatar";
import { useBandMember } from "@/components/artist/BandMemberContext";
import type { BandMember, EventMessage, EventThreadRecord } from "@/components/artist/band-types";
import { memberLabel } from "@/components/artist/band-types";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

function timestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function mentionNames(body: string, members: BandMember[]) {
  const lowerCaseBody = body.toLowerCase();
  return members.map(memberLabel).filter((name) => lowerCaseBody.includes(`@${name.toLowerCase()}`));
}

export function EventThread({ thread, members, initialMessages = [] }: { thread: EventThreadRecord; members: BandMember[]; initialMessages?: EventMessage[] }) {
  const { currentBandMember, openMemberPicker } = useBandMember();
  const [messages, setMessages] = useState<EventMessage[]>(initialMessages);
  const [body, setBody] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const messageList = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    let mounted = true;
    async function loadMessages() {
      const { data } = await supabase.from("event_messages").select("id, thread_id, band_member_id, profile_id, author_name, author_avatar_color, author_role, body, is_system_message, mentions, reactions, deleted_at, created_at").eq("thread_id", thread.id).is("deleted_at", null).order("created_at").returns<EventMessage[]>();
      if (mounted && data) setMessages(data);
    }
    void loadMessages();
    const channel = supabase.channel(`event-thread:${thread.id}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "event_messages", filter: `thread_id=eq.${thread.id}` }, (payload) => {
      const incoming = payload.new as EventMessage;
      setMessages((current) => current.some((message) => message.id === incoming.id) ? current : [...current, incoming]);
    }).on("postgres_changes", { event: "UPDATE", schema: "public", table: "event_messages", filter: `thread_id=eq.${thread.id}` }, (payload) => {
      const incoming = payload.new as EventMessage;
      setMessages((current) => current.map((message) => message.id === incoming.id ? incoming : message));
    }).subscribe();
    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [supabase, thread.id]);

  useEffect(() => {
    messageList.current?.scrollTo({ top: messageList.current.scrollHeight });
  }, [messages]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || thread.is_locked) return;
    if (!currentBandMember) {
      openMemberPicker();
      return;
    }
    setState("sending");
    const { data, error } = await supabase.from("event_messages").insert({
      thread_id: thread.id,
      band_member_id: currentBandMember.id,
      author_name: memberLabel(currentBandMember),
      author_avatar_color: currentBandMember.avatar_color,
      author_role: "member",
      body: trimmed.slice(0, 4000),
      mentions: mentionNames(trimmed, members),
    }).select().single<EventMessage>();
    if (error || !data) {
      setState("error");
      return;
    }
    setMessages((current) => current.some((message) => message.id === data.id) ? current : [...current, data]);
    setBody("");
    setState("idle");
  }

  async function toggleReaction(message: EventMessage, reaction: string) {
    if (!currentBandMember || message.is_system_message) {
      if (!currentBandMember) openMemberPicker();
      return;
    }
    const name = memberLabel(currentBandMember);
    const existing = message.reactions?.[reaction] || [];
    const people = existing.includes(name) ? existing.filter((person) => person !== name) : [...existing, name];
    const reactions = { ...(message.reactions || {}) };
    if (people.length) reactions[reaction] = people;
    else delete reactions[reaction];
    const { data } = await supabase.from("event_messages").update({ reactions }).eq("id", message.id).select().single<EventMessage>();
    if (data) setMessages((current) => current.map((item) => item.id === data.id ? data : item));
  }

  return <section className="border border-mercury bg-carbon">
    <div className="flex items-center justify-between border-b border-steel px-4 py-3"><div><p className="font-mono text-[8px] uppercase tracking-[.13em] text-plasma">{thread.event_type === "general" ? "Band chat" : "Event thread"}</p><p className="mt-1 text-sm text-bone">{thread.title || "Band coordination"}</p></div><span className="font-mono text-[8px] uppercase tracking-[.1em] text-ghost">{thread.is_locked ? "Locked" : "Live"}</span></div>
    <div className="max-h-80 min-h-40 space-y-3 overflow-y-auto p-4" ref={messageList}>
      {messages.length ? messages.map((message) => {
        const member = members.find((item) => item.id === message.band_member_id);
        return <article className={message.is_system_message ? "border-l border-steel pl-3" : "flex gap-3"} key={message.id}>
          {!message.is_system_message ? member ? <BandMemberAvatar member={member} /> : <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full border" style={{ borderColor: message.author_avatar_color }} /> : null}
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline gap-x-2"><span className={`text-xs ${message.is_system_message ? "italic text-ghost" : "text-bone"}`}>{message.is_system_message ? "System" : message.author_name}</span><span className="font-mono text-[8px] uppercase tracking-[.08em] text-ghost">{timestamp(message.created_at)}</span></div><p className={`mt-1 whitespace-pre-wrap text-sm leading-5 ${message.is_system_message ? "italic text-ghost" : "text-bone"}`}>{message.body}</p>{!message.is_system_message ? <div className="mt-2 flex flex-wrap gap-1"><button aria-label="React with thumbs up" className="border border-steel px-1.5 py-0.5 text-[10px] text-ghost hover:border-flux" onClick={() => toggleReaction(message, "👍")} type="button">👍{message.reactions?.["👍"]?.length ? ` ${message.reactions["👍"].length}` : ""}</button><button aria-label="React with fire" className="border border-steel px-1.5 py-0.5 text-[10px] text-ghost hover:border-plasma" onClick={() => toggleReaction(message, "🔥")} type="button">🔥{message.reactions?.["🔥"]?.length ? ` ${message.reactions["🔥"].length}` : ""}</button></div> : null}</div>
        </article>;
      }) : <p className="py-7 text-center text-sm text-ghost">No messages yet. Start the coordination here.</p>}
    </div>
    <form className="border-t border-steel p-3" onSubmit={send}><div className="flex gap-2"><input className="min-w-0 flex-1 border border-mercury bg-void px-3 py-2.5 text-sm text-bone outline-none placeholder:text-ghost focus:border-plasma" disabled={thread.is_locked || state === "sending"} onChange={(input) => setBody(input.target.value)} placeholder={thread.is_locked ? "This thread is locked" : "Message the band — use @Name to mention"} value={body} /><button aria-label="Send message" className="border border-plasma px-3 text-plasma transition hover:bg-plasma hover:text-void disabled:opacity-50" disabled={!body.trim() || thread.is_locked || state === "sending"} type="submit"><Send className="h-4 w-4" /></button></div><div className="mt-2 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[.09em] text-ghost"><SmilePlus className="h-3 w-3" />Messages are visible to everyone using this artist account.</div>{state === "error" ? <p className="mt-2 text-xs text-red-300">Message did not send. Try again.</p> : null}</form>
  </section>;
}
