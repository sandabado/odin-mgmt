"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PlayablePublicRelease } from "@/lib/public-catalog";
import { InlineTurntablePlayer } from "./turntable/InlineTurntablePlayer";
import { useTurntable } from "./turntable/TurntableProvider";

export interface MuseumReleasePlayerProps {
  headingId: string;
  presentation?: "immersive" | "shelf";
  release: PlayablePublicRelease;
  sectionId: string;
}

export function MuseumReleasePlayer({
  headingId,
  presentation = "shelf",
  release,
  sectionId,
}: MuseumReleasePlayerProps) {
  const { enabled, isActiveRelease, selectRelease } = useTurntable();
  const active = enabled && isActiveRelease(release);
  const immersive = presentation === "immersive";
  const interactive = immersive && enabled;
  const hasAutoCuedRef = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    if (!interactive) return;
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) {
      setNearViewport(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNearViewport(true);
        observer.disconnect();
      },
      { rootMargin: "360px 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [interactive]);

  useEffect(() => {
    if (!interactive || !nearViewport || active || hasAutoCuedRef.current) {
      return;
    }
    hasAutoCuedRef.current = true;
    selectRelease(release);
  }, [active, interactive, nearViewport, release, selectRelease]);

  return (
    <section
      aria-labelledby={headingId}
      className={`museum-release-player museum-record-shelf ${immersive ? "museum-release-player--immersive" : ""}`}
      data-player-section={interactive ? "interactive" : "external"}
      id={sectionId}
      ref={sectionRef}
    >
      <div className="museum-release-player__heading">
        <p className="records-kicker">
          {immersive ? "The record player" : "The listening shelf"}
        </p>
        <h3 id={headingId}>
          {interactive ? "Lower the needle." : `Listen to ${release.title}.`}
        </h3>
        <p>
          {release.artistName} · {release.tracks.length} tracks · Released
          catalog
        </p>
      </div>

      {interactive ? (
        <InlineTurntablePlayer headingId={headingId} release={release} />
      ) : (
        <a
          aria-label={`Listen to ${release.title} by ${release.artistName} on Spotify`}
          className="museum-record-shelf__album"
          href={release.listenUrl}
          rel="noreferrer"
          target="_blank"
        >
          <span className="museum-record-shelf__sleeve">
            <Image
              alt={release.coverImageAlt ?? `${release.title} album artwork`}
              fill
              sizes="(max-width: 640px) 58vw, 260px"
              src={release.coverImage}
            />
          </span>
          <span>
            <strong>Listen on Spotify</strong>
            <small>{release.tracks.length} tracks · Opens Spotify</small>
          </span>
          <i aria-hidden="true">↗</i>
        </a>
      )}
    </section>
  );
}
