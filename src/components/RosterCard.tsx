import type { CSSProperties } from "react";

type RosterCardProps = { artist: { name: string; discipline: string; mark: string; summary: string; color: string } };

export function RosterCard({ artist }: RosterCardProps) {
  return <article className="roster-card" style={{ "--artist-color": artist.color } as CSSProperties}>
    <div className="artist-mark" aria-hidden="true">{artist.mark}</div>
    <p className="eyebrow">{artist.discipline}</p>
    <h3>{artist.name}</h3>
    <p>{artist.summary}</p>
    <span className="text-link">View artist <span aria-hidden="true">↗</span></span>
  </article>;
}
