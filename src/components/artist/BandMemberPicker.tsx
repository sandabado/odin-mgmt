"use client";

import { X } from "lucide-react";
import { BandMemberAvatar } from "@/components/artist/BandMemberAvatar";
import type { BandMember } from "@/components/artist/band-types";
import { memberLabel } from "@/components/artist/band-types";

export function BandMemberPicker({ members, currentMemberId, open, onClose, onSelect }: { members: BandMember[]; currentMemberId: string | null; open: boolean; onClose: () => void; onSelect: (member: BandMember) => void }) {
  if (!open) return null;

  return <div aria-modal="true" className="fixed inset-0 z-[70] grid place-items-center bg-void/80 p-4 backdrop-blur-sm" role="dialog">
    <section className="w-full max-w-lg border border-mercury bg-carbon p-5 shadow-2xl sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div><p className="font-mono text-[9px] uppercase tracking-[.15em] text-plasma">Shared band login</p><h2 className="mt-2 font-display text-4xl leading-none text-bone">Who are you?</h2><p className="mt-3 max-w-sm text-sm leading-6 text-ghost">Choose your name before responding or messaging. You can switch any time from the header.</p></div>
        {currentMemberId ? <button aria-label="Close member picker" className="border border-steel p-2 text-ghost transition hover:border-mercury hover:text-bone" onClick={onClose} type="button"><X className="h-4 w-4" /></button> : null}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {members.map((member) => <button className={`grid justify-items-center gap-3 border p-4 text-center transition ${currentMemberId === member.id ? "border-flux bg-flux/10" : "border-mercury hover:border-plasma hover:bg-steel"}`} key={member.id} onClick={() => onSelect(member)} type="button">
          <BandMemberAvatar member={member} size="lg" />
          <span><span className="block text-sm text-bone">{memberLabel(member)}</span><span className="mt-1 block font-mono text-[8px] uppercase tracking-[.1em] text-ghost">{member.role.replaceAll("_", " ")}</span></span>
        </button>)}
      </div>
      {!members.length ? <p className="mt-6 border border-dashed border-mercury p-4 text-sm text-ghost">No active band members have been added yet. An operations admin can add them from the database after the migration runs.</p> : null}
      <p className="mt-5 font-mono text-[8px] uppercase tracking-[.12em] text-ghost">Tap your name. This shared account does not require a PIN yet.</p>
    </section>
  </div>;
}
