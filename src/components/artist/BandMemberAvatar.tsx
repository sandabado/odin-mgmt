import type { BandMember } from "@/components/artist/band-types";
import { memberLabel } from "@/components/artist/band-types";

export function BandMemberAvatar({ member, size = "sm", showLabel = false }: { member: Pick<BandMember, "name" | "display_name" | "role" | "avatar_url" | "avatar_color">; size?: "sm" | "md" | "lg"; showLabel?: boolean }) {
  const label = memberLabel(member);
  const initials = label.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const dimension = size === "lg" ? "h-12 w-12 text-sm" : size === "md" ? "h-8 w-8 text-[10px]" : "h-6 w-6 text-[8px]";

  return <span className="inline-flex items-center gap-2" title={`${label} · ${member.role.replaceAll("_", " ")}`}>
    {member.avatar_url ? <img alt="" className={`${dimension} rounded-full border object-cover`} src={member.avatar_url} style={{ borderColor: member.avatar_color }} /> : <span className={`${dimension} grid shrink-0 place-items-center rounded-full border font-mono font-bold`} style={{ borderColor: member.avatar_color, color: member.avatar_color }}>{initials}</span>}
    {showLabel ? <span className="min-w-0 truncate text-xs text-bone">{label}</span> : null}
  </span>;
}
