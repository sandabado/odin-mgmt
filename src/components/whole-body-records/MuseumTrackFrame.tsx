import type { PublicTrack } from "@/lib/public-catalog";

export interface MuseumTrackFrameProps {
  track: PublicTrack;
}

export function MuseumTrackFrame({ track }: MuseumTrackFrameProps) {
  return (
    <article className="museum-track-frame">
      <div className="museum-track-frame__canvas" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="museum-track-frame__plaque">
        <span>{String(track.number).padStart(2, "0")}</span>
        <h3>{track.title}</h3>
        <time>{track.duration}</time>
      </div>
    </article>
  );
}
