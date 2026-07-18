"use client";

import { X } from "lucide-react";
import { EventThread } from "@/components/artist/EventThread";
import type { BandMember, EventThreadRecord } from "@/components/artist/band-types";

export function GeneralChatPanel({ open, onClose, thread, members }: { open: boolean; onClose: () => void; thread: EventThreadRecord | null; members: BandMember[] }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex justify-end bg-void/60 backdrop-blur-sm" role="dialog" aria-label="Band chat">
    <aside className="flex h-full w-full max-w-xl flex-col border-l border-mercury bg-carbon shadow-2xl"><div className="flex items-center justify-between border-b border-mercury px-5 py-4"><div><p className="font-mono text-[9px] uppercase tracking-[.13em] text-plasma">Shared room</p><h2 className="mt-1 font-display text-3xl leading-none">Band chat</h2></div><button aria-label="Close band chat" className="border border-steel p-2 text-ghost transition hover:border-mercury hover:text-bone" onClick={onClose} type="button"><X className="h-4 w-4" /></button></div><div className="min-h-0 flex-1 overflow-y-auto p-4">{thread ? <EventThread members={members} thread={thread} /> : <p className="border border-dashed border-mercury p-5 text-sm text-ghost">The general band chat will appear here as soon as a member is created.</p>}</div></aside>
  </div>;
}
