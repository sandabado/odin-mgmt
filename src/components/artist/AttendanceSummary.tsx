import { BandMemberAvatar } from "@/components/artist/BandMemberAvatar";
import type { BandMember, EventRsvp } from "@/components/artist/band-types";
import { memberLabel } from "@/components/artist/band-types";

const responsePresentation = {
  confirmed: { icon: "✓", label: "Confirmed", tone: "text-flux" },
  tentative: { icon: "?", label: "Tentative", tone: "text-halo" },
  declined: { icon: "×", label: "Unavailable", tone: "text-red-300" },
  late: { icon: "◷", label: "Coming late", tone: "text-plasma" },
} as const;

export function AttendanceSummary({ members, rsvps, compact = false }: { members: BandMember[]; rsvps: EventRsvp[]; compact?: boolean }) {
  const rsvpFor = (memberId: string) => rsvps.find((rsvp) => rsvp.band_member_id === memberId);
  const confirmedCount = rsvps.filter((rsvp) => rsvp.response === "confirmed" || rsvp.response === "late").length;
  const tentativeCount = rsvps.filter((rsvp) => rsvp.response === "tentative").length;

  if (compact) return <span className="inline-flex items-center gap-1 font-mono text-[9px] text-ghost" title={`${confirmedCount}/${members.length} confirmed`}>
    {members.map((member) => {
      const rsvp = rsvpFor(member.id);
      const presentation = rsvp ? responsePresentation[rsvp.response] : null;
      return <span className={presentation?.tone || "text-ghost"} key={member.id}>{presentation?.icon || "○"}</span>;
    })}
    <span className="ml-1">{confirmedCount}/{members.length}</span>
  </span>;

  return <div className="border border-steel bg-void/50 p-3">
    <div className="flex items-center justify-between gap-3"><p className="font-mono text-[8px] uppercase tracking-[.13em] text-ghost">Attendance</p><p className="font-mono text-[8px] uppercase tracking-[.1em] text-ghost">{confirmedCount} confirmed{tentativeCount ? ` · ${tentativeCount} tentative` : ""}</p></div>
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {members.map((member) => {
        const rsvp = rsvpFor(member.id);
        const presentation = rsvp ? responsePresentation[rsvp.response] : null;
        return <div className="flex min-w-0 items-center gap-2" key={member.id}>
          <BandMemberAvatar member={member} />
          <span className="min-w-0 flex-1 truncate text-xs text-bone">{memberLabel(member)}</span>
          <span className={`shrink-0 font-mono text-[8px] uppercase tracking-[.08em] ${presentation?.tone || "text-ghost"}`}>{presentation ? `${presentation.icon} ${presentation.label}${rsvp?.late_arrival_time ? ` · ${rsvp.late_arrival_time}` : ""}` : "○ Pending"}</span>
        </div>;
      })}
    </div>
  </div>;
}
