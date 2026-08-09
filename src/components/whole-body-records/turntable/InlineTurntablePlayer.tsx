"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { PlayablePublicRelease } from "@/lib/public-catalog";
import { useTurntable } from "./TurntableProvider";

export interface InlineTurntablePlayerProps {
  headingId: string;
  release: PlayablePublicRelease;
}

function statusLabel(status: ReturnType<typeof useTurntable>["status"]) {
  if (status === "selected") return "Record cued";
  if (status === "loading") return "Needle descending";
  if (status === "playing") return "Now playing";
  if (status === "paused") return "Held in suspension";
  if (status === "error") return "Playback held";
  return "Platter open";
}

export function InlineTurntablePlayer({
  headingId,
  release,
}: InlineTurntablePlayerProps) {
  const {
    activeRelease,
    announcement,
    controllerReady,
    enabled,
    error,
    isActiveRelease,
    nextTrack,
    previousTrack,
    progress,
    registerSpotifyHost,
    selectRelease,
    selectTrack,
    status,
    togglePlayback,
    trackIndex,
  } = useTurntable();
  const active = isActiveRelease(release);
  const activeTrack = active ? release.tracks[trackIndex] : null;
  const isLoading = active && status === "loading";
  const isPlaying = active && status === "playing";
  const canControl = active && controllerReady;
  const style = {
    "--turntable-progress": `${Math.min(100, Math.max(0, progress))}%`,
  } as CSSProperties;

  return (
    <div
      aria-busy={isLoading}
      aria-labelledby={headingId}
      className="wbr-inline-turntable"
      data-player-placement="inline"
      data-state={active ? status : "idle"}
      data-testid="wbr-inline-turntable"
      style={style}
    >
      <p aria-atomic="true" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div className="wbr-inline-turntable__deck">
        <div className="wbr-inline-turntable__topline">
          <span>Whole Body Records</span>
          <span>{statusLabel(active ? status : "idle")}</span>
        </div>

        <div className="wbr-inline-turntable__ritual">
          <div className="wbr-inline-turntable__platter" aria-hidden="true">
            <span className="wbr-inline-turntable__platter-ring" />
            <span
              className={`wbr-inline-turntable__record ${isPlaying ? "is-spinning" : ""} ${isLoading ? "is-loading" : ""}`}
            >
              {active ? (
                <Image
                  alt=""
                  fill
                  sizes="(max-width: 640px) 250px, 390px"
                  src={release.coverImage}
                />
              ) : (
                <span className="wbr-inline-turntable__empty-groove" />
              )}
              <i />
            </span>
            <span className="wbr-inline-turntable__spindle" />
          </div>

          <button
            aria-label={
              isPlaying
                ? "Lift the needle and pause"
                : active
                  ? "Lower the needle and play"
                  : `Place ${release.title} on the platter`
            }
            aria-pressed={isPlaying}
            className="wbr-inline-turntable__tonearm"
            disabled={active && !canControl}
            onClick={() => {
              if (active) togglePlayback();
              else selectRelease(release);
            }}
            type="button"
          >
            <span aria-hidden="true" />
          </button>
        </div>

        <div className="wbr-inline-turntable__readout">
          <p>{statusLabel(active ? status : "idle")}</p>
          <strong>{active ? release.title : "The platter is open."}</strong>
          <span>
            {active
              ? `${release.artistName} · ${activeTrack?.title ?? "Record cued"}`
              : `Cue ${release.title} by ${release.artistName}`}
          </span>
        </div>

        <progress
          aria-label="Track playback progress"
          className="wbr-inline-turntable__progress"
          max="100"
          value={active ? progress : 0}
        />

        <div
          aria-label="Record player controls"
          className="wbr-inline-turntable__controls"
          role="group"
        >
          <button
            aria-label="Previous track"
            disabled={!canControl}
            onClick={previousTrack}
            type="button"
          >
            <span aria-hidden="true">|‹</span>
            Previous
          </button>
          <button
            aria-label={
              !active
                ? `Place ${release.title} on the platter`
                : isPlaying
                  ? "Pause record"
                  : "Play record"
            }
            aria-pressed={isPlaying}
            className="wbr-inline-turntable__play"
            disabled={active && !canControl}
            onClick={() => {
              if (active) togglePlayback();
              else selectRelease(release);
            }}
            type="button"
          >
            <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
            {active ? (isPlaying ? "Pause" : "Play") : "Cue record"}
          </button>
          <button
            aria-label="Next track"
            disabled={!canControl}
            onClick={nextTrack}
            type="button"
          >
            <span aria-hidden="true">›|</span>
            Next
          </button>
        </div>

        {error ? (
          <p className="wbr-inline-turntable__error" role="status">
            {error}
          </p>
        ) : null}
      </div>

      <div className="wbr-inline-turntable__library">
        <div className="wbr-inline-turntable__library-heading">
          <p>On the turntable</p>
          <h4>{release.title}</h4>
          <span>
            {release.artistName} · {release.tracks.length} tracks
          </span>
        </div>

        <ol
          aria-label={`${release.title} track queue`}
          className="wbr-inline-turntable__queue"
        >
          {release.tracks.map((track, index) => (
            <li key={`${track.spotifyUri}-${track.title}`}>
              <button
                aria-current={
                  active && index === trackIndex ? "true" : undefined
                }
                disabled={!canControl}
                onClick={() => selectTrack(index)}
                type="button"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{track.title}</strong>
                <time>{track.duration}</time>
              </button>
            </li>
          ))}
        </ol>

        <div
          aria-label="Spotify playback controls"
          className={`wbr-inline-turntable__spotify ${active ? "is-active" : ""}`}
          ref={registerSpotifyHost}
          role="group"
        />

        <a
          className="wbr-inline-turntable__external"
          href={release.listenUrl}
          rel="noreferrer"
          target="_blank"
        >
          Open the record in Spotify <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}
