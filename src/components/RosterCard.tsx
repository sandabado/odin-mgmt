import type { CSSProperties } from "react";
import Image from "next/image";

type RosterCardProps = { artist: { name: string; discipline: string; mark: string; summary: string; color: string; image?: string; imageAlt?: string; imagePosition?: string } };

export function RosterCard({ artist }: RosterCardProps) {
  return <article className={`roster-card${artist.image ? " roster-card--image" : ""}`} style={{ "--artist-color": artist.color, "--artist-image-position": artist.imagePosition ?? "50% 50%" } as CSSProperties}>
    {artist.image ? <div className="roster-card__media"><Image alt={artist.imageAlt ?? `${artist.name} artist portrait`} fill sizes="(max-width: 580px) 100vw, (max-width: 900px) 50vw, 25vw" src={artist.image} /></div> : null}
    <div className="artist-mark" aria-hidden="true">{artist.mark}</div>
    <p className="eyebrow">{artist.discipline}</p>
    <h3>{artist.name}</h3>
    <p>{artist.summary}</p>
    <span className="text-link">View artist <span aria-hidden="true">↗</span></span>
  </article>;
}
