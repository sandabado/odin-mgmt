"use client";

import Image from "next/image";
import type {
  CSSProperties,
  KeyboardEvent,
  RefCallback,
  TouchEvent,
} from "react";
import { useRef } from "react";
import type { PlayablePublicRelease } from "@/lib/public-catalog";
import type { TurntableStatus } from "@/lib/turntable-state";

export interface TurntablePlayerProps {
  announcement: string;
  controllerReady: boolean;
  error: string | null;
  minimized: boolean;
  onEject: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onMinimize: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onTogglePlayback: () => void;
  onExpand: () => void;
  progress: number;
  release: PlayablePublicRelease | null;
  spotifyHostRef: RefCallback<HTMLDivElement>;
  status: TurntableStatus;
  trackIndex: number;
  visible: boolean;
}

function statusLabel(status: TurntableStatus) {
  if (status === "selected") return "Record selected";
  if (status === "loading") return "Needle descending";
  if (status === "playing") return "Now playing";
  if (status === "paused") return "Held in suspension";
  if (status === "error") return "Playback held";
  return "Waiting for a record";
}

export function TurntablePlayer({
  announcement,
  controllerReady,
  error,
  minimized,
  onEject,
  onExpand,
  onKeyDown,
  onMinimize,
  onNext,
  onPrevious,
  onTogglePlayback,
  progress,
  release,
  spotifyHostRef,
  status,
  trackIndex,
  visible,
}: TurntablePlayerProps) {
  const touchOriginRef = useRef<{ x: number; y: number } | null>(null);
  const track = release?.tracks[trackIndex] ?? null;
  const isPlaying = status === "playing";
  const isLoading = status === "loading";
  const canControl = Boolean(release && controllerReady);
  const description = release
    ? `Vinyl record player. ${statusLabel(status)}: ${release.title} by ${release.artistName}. Track ${trackIndex + 1} of ${release.tracks.length}, ${track?.title ?? "selected"}.`
    : "Vinyl record player. Empty platter. Choose a released record in the collection.";
  const style = {
    "--turntable-progress": `${Math.min(100, Math.max(0, progress))}%`,
  } as CSSProperties;
  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0];
    touchOriginRef.current = { x: touch.clientX, y: touch.clientY };
  };
  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const origin = touchOriginRef.current;
    const touch = event.changedTouches[0];
    touchOriginRef.current = null;
    if (!origin || !release) return;
    const deltaX = touch.clientX - origin.x;
    const deltaY = touch.clientY - origin.y;
    if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) onNext();
      else onPrevious();
    } else if (deltaY > 56 && Math.abs(deltaY) > Math.abs(deltaX)) {
      onMinimize();
    }
  };

  return (
    <aside
      aria-describedby="wbr-turntable-description"
      aria-label="Music player"
      className={`wbr-turntable ${minimized ? "wbr-turntable--minimized" : ""}`}
      data-state={status}
      hidden={!visible}
      onKeyDown={onKeyDown}
      role="application"
      style={style}
      tabIndex={minimized ? -1 : 0}
    >
      <p
        aria-atomic="true"
        aria-live="polite"
        className="sr-only"
        id="wbr-turntable-description"
      >
        {description}
      </p>
      <p aria-atomic="true" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {minimized ? (
        <button
          aria-label={
            release
              ? `Expand record player. ${release.title} is ${status}.`
              : "Expand empty record player"
          }
          className="wbr-turntable__mini"
          onClick={onExpand}
          type="button"
        >
          <span
            aria-hidden="true"
            className={`wbr-turntable__mini-record ${isPlaying ? "is-spinning" : ""}`}
          >
            {release?.coverImage ? (
              <Image alt="" fill sizes="58px" src={release.coverImage} />
            ) : null}
          </span>
          <span>{release ? track?.title : "Choose a record"}</span>
        </button>
      ) : (
        <>
          <div
            className={`wbr-turntable__spotify-panel ${release ? "is-visible" : ""}`}
          >
            <p>
              Spotify playback
              <span>Full transport and volume controls</span>
            </p>
            <div
              aria-label="Spotify playback controls"
              className="wbr-turntable__spotify-host"
              ref={spotifyHostRef}
              role="group"
            />
          </div>

          <div className="wbr-turntable__deck">
            <div className="wbr-turntable__topline">
              <span>Whole Body Records</span>
              <div>
                {release ? (
                  <button
                    aria-label="Eject record"
                    onClick={onEject}
                    type="button"
                  >
                    Eject
                  </button>
                ) : null}
                <button
                  aria-label="Minimize record player"
                  onClick={onMinimize}
                  type="button"
                >
                  Minimize
                </button>
              </div>
            </div>

            <div
              className="wbr-turntable__ritual"
              onTouchEnd={handleTouchEnd}
              onTouchStart={handleTouchStart}
            >
              <div className="wbr-turntable__platter" aria-hidden="true">
                <span className="wbr-turntable__platter-ring" />
                <span
                  className={`wbr-turntable__record ${isPlaying ? "is-spinning" : ""} ${isLoading ? "is-loading" : ""}`}
                >
                  {release?.coverImage ? (
                    <Image
                      alt=""
                      fill
                      sizes="(max-width: 640px) 116px, 176px"
                      src={release.coverImage}
                    />
                  ) : (
                    <span className="wbr-turntable__empty-groove" />
                  )}
                  <i />
                </span>
                <span className="wbr-turntable__spindle" />
              </div>

              <button
                aria-label={
                  isPlaying ? "Lift needle and pause" : "Lower needle and play"
                }
                className="wbr-turntable__tonearm"
                disabled={!canControl}
                onClick={onTogglePlayback}
                type="button"
              >
                <span aria-hidden="true" />
              </button>
            </div>

            <div className="wbr-turntable__readout">
              <p>{statusLabel(status)}</p>
              <strong>{release?.title ?? "The platter is open."}</strong>
              <span>
                {release
                  ? `${release.artistName} · ${track?.title ?? "Track held"}`
                  : "Choose 333 from the released collection."}
              </span>
            </div>

            <div className="wbr-turntable__progress" aria-hidden="true">
              <span />
            </div>

            <div className="wbr-turntable__controls">
              <button
                aria-label="Play or pause"
                disabled={!canControl}
                onClick={onTogglePlayback}
                type="button"
              >
                <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
              </button>
              <button
                aria-label="Next track"
                disabled={!canControl}
                onClick={onNext}
                type="button"
              >
                <span aria-hidden="true">›|</span>
              </button>
              <button
                aria-label="Previous track"
                disabled={!canControl}
                onClick={onPrevious}
                type="button"
              >
                <span aria-hidden="true">|‹</span>
              </button>
            </div>

            {error ? <p className="wbr-turntable__error">{error}</p> : null}
          </div>
        </>
      )}
    </aside>
  );
}
