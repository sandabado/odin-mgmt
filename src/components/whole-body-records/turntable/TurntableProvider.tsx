"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  type KeyboardEvent,
  type ReactNode,
  type RefCallback,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  playablePublicReleases,
  type PlayablePublicRelease,
} from "@/lib/public-catalog";
import {
  initialTurntableState,
  turntableReducer,
  wrappedTrackIndex,
} from "@/lib/turntable-state";
import { TurntablePlayer } from "./TurntablePlayer";

interface SpotifyPlaybackData {
  duration: number;
  isBuffering: boolean;
  isPaused: boolean;
  playingURI: string;
  position: number;
}

interface SpotifyEmbedController {
  addListener: (
    event: "ready" | "playback_started" | "playback_update",
    listener: (event: { data: SpotifyPlaybackData }) => void,
  ) => void;
  destroy: () => void;
  loadEntity: (
    spotifyUriOrUrl: string,
    preferVideo?: boolean,
    startAt?: number,
  ) => void;
  pause: () => void;
  play: () => void;
  seek: (seconds: number) => void;
}

interface SpotifyIframeApi {
  createController: (
    element: HTMLElement,
    options: {
      height: number | string;
      uri: string;
      width: number | string;
    },
    callback: (controller: SpotifyEmbedController) => void,
  ) => void;
}

declare global {
  interface Window {
    __wbrSpotifyIframeApi?: SpotifyIframeApi;
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
  }
}

export interface TurntableProviderProps {
  children: ReactNode;
  enabled?: boolean;
  persistentPlayerEnabled?: boolean;
  releases?: PlayablePublicRelease[];
}

export interface TurntableContextValue {
  activeRelease: PlayablePublicRelease | null;
  announcement: string;
  controllerReady: boolean;
  enabled: boolean;
  error: string | null;
  isActiveRelease: (release: PlayablePublicRelease) => boolean;
  nextTrack: () => void;
  previousTrack: () => void;
  progress: number;
  registerSpotifyHost: RefCallback<HTMLDivElement>;
  selectRelease: (release: PlayablePublicRelease) => void;
  selectTrack: (trackIndex: number) => void;
  status: typeof initialTurntableState.status;
  togglePlayback: () => void;
  trackIndex: number;
}

const TurntableContext = createContext<TurntableContextValue | null>(null);
const STORAGE_KEY = "wbr-turntable-session";
const PUBLIC_PATHS = new Set([
  "/",
  "/account",
  "/artists",
  "/cart",
  "/catalog",
  "/art-of-the-song",
  "/ink-on-water",
  "/management",
  "/museum",
  "/partners",
  "/privacy",
  "/releases",
  "/services",
  "/store",
  "/submit",
  "/sync",
  "/terms",
  "/tour",
]);

function isTurntablePublicPath(pathname: string) {
  return PUBLIC_PATHS.has(pathname) || pathname.startsWith("/artists/");
}

function releaseKey(release: PlayablePublicRelease) {
  return `${release.artistSlug}:${release.title}`;
}

function playNeedleDrop(
  contextRef: React.MutableRefObject<AudioContext | null>,
) {
  try {
    const context = contextRef.current ?? new AudioContext();
    contextRef.current = context;
    void context.resume();
    const now = context.currentTime;

    const crackleBuffer = context.createBuffer(
      1,
      Math.floor(context.sampleRate * 0.48),
      context.sampleRate,
    );
    const crackleChannel = crackleBuffer.getChannelData(0);
    for (let index = 0; index < crackleChannel.length; index += 1) {
      const envelope = 1 - index / crackleChannel.length;
      crackleChannel[index] =
        (Math.random() * 2 - 1) *
        envelope *
        (Math.random() > 0.985 ? 0.8 : 0.12);
    }
    const crackle = context.createBufferSource();
    const crackleFilter = context.createBiquadFilter();
    const crackleGain = context.createGain();
    crackle.buffer = crackleBuffer;
    crackleFilter.type = "lowpass";
    crackleFilter.frequency.value = 3200;
    crackleGain.gain.setValueAtTime(0.035, now);
    crackleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
    crackle.connect(crackleFilter);
    crackleFilter.connect(crackleGain);
    crackleGain.connect(context.destination);

    const click = context.createOscillator();
    const clickGain = context.createGain();
    click.type = "triangle";
    click.frequency.setValueAtTime(980, now);
    click.frequency.exponentialRampToValueAtTime(360, now + 0.05);
    clickGain.gain.setValueAtTime(0.17, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    click.connect(clickGain);
    clickGain.connect(context.destination);

    crackle.start(now);
    click.start(now + 0.035);
    click.stop(now + 0.06);
  } catch {
    // Playback remains functional when synthetic ritual audio is unavailable.
  }
}

export function useTurntable() {
  const value = useContext(TurntableContext);
  if (!value) {
    throw new Error("useTurntable must be used inside TurntableProvider.");
  }
  return value;
}

export function TurntableProvider({
  children,
  enabled = false,
  persistentPlayerEnabled = false,
  releases = playablePublicReleases,
}: TurntableProviderProps) {
  const pathname = usePathname();
  const [state, dispatch] = useReducer(turntableReducer, initialTurntableState);
  const [announcement, setAnnouncement] = useState("");
  const [controllerReady, setControllerReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [spotifyHostElement, setSpotifyHostElement] =
    useState<HTMLDivElement | null>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  const selectedReleaseRef = useRef<PlayablePublicRelease | null>(null);
  const stateRef = useRef(state);
  const needleAudioRef = useRef<AudioContext | null>(null);
  const hasStartedRef = useRef(false);
  const restoredPositionRef = useRef(0);
  const persistedAtRef = useRef(0);
  const autoAdvancedTrackRef = useRef<string | null>(null);
  const nextTrackRef = useRef<(direction: -1 | 1) => void>(() => undefined);
  const visible = isTurntablePublicPath(pathname);
  const registerSpotifyHost = useCallback<RefCallback<HTMLDivElement>>(
    (element) => setSpotifyHostElement(element),
    [],
  );

  const activeRelease = useMemo(
    () =>
      releases.find((release) => releaseKey(release) === state.releaseKey) ??
      null,
    [releases, state.releaseKey],
  );

  useEffect(() => {
    stateRef.current = state;
    selectedReleaseRef.current = activeRelease;
  }, [activeRelease, state]);

  useEffect(() => {
    if (!enabled) return;
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as {
        position?: number;
        releaseKey?: string;
        trackIndex?: number;
      };
      const release = releases.find(
        (candidate) => releaseKey(candidate) === parsed.releaseKey,
      );
      if (!release) return;
      const trackIndex = Math.min(
        Math.max(parsed.trackIndex ?? 0, 0),
        release.tracks.length - 1,
      );
      restoredPositionRef.current = Math.max(parsed.position ?? 0, 0);
      dispatch({
        type: "RESTORE",
        releaseKey: releaseKey(release),
        trackIndex,
      });
      setAnnouncement(
        `Restored ${release.title} by ${release.artistName}. Press play to resume.`,
      );
    } catch {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [enabled, releases]);

  useEffect(() => {
    if (!enabled) return;
    if (!visible && state.status === "playing") {
      controllerRef.current?.pause();
      dispatch({ type: "PAUSE" });
    }
  }, [enabled, state.status, visible]);

  useEffect(() => {
    if (!enabled || !visible) {
      delete document.documentElement.dataset.wbrPlayback;
      return;
    }
    document.documentElement.dataset.wbrPlayback = state.status;
    return () => {
      delete document.documentElement.dataset.wbrPlayback;
    };
  }, [enabled, state.status, visible]);

  useEffect(() => {
    if (!enabled || !activeRelease || !spotifyHostElement) return;
    let cancelled = false;

    const createController = (api: SpotifyIframeApi) => {
      const release = selectedReleaseRef.current;
      const current = stateRef.current;
      if (
        !spotifyHostElement ||
        !release ||
        controllerRef.current ||
        cancelled
      ) {
        return;
      }
      const track =
        release.tracks[Math.min(current.trackIndex, release.tracks.length - 1)];

      api.createController(
        spotifyHostElement,
        {
          height: 152,
          uri: track.spotifyUri,
          width: "100%",
        },
        (controller) => {
          if (cancelled) {
            controller.destroy();
            return;
          }
          controllerRef.current = controller;
          controller.addListener("ready", () => {
            setControllerReady(true);
            if (restoredPositionRef.current > 0) {
              controller.seek(restoredPositionRef.current / 1000);
              restoredPositionRef.current = 0;
            }
          });
          controller.addListener("playback_started", (event) => {
            hasStartedRef.current = true;
            autoAdvancedTrackRef.current = null;
            const selected = selectedReleaseRef.current;
            if (!selected) return;
            const nextIndex = selected.tracks.findIndex(
              (candidate) => candidate.spotifyUri === event.data.playingURI,
            );
            const safeIndex =
              nextIndex >= 0 ? nextIndex : stateRef.current.trackIndex;
            dispatch({ type: "PLAYING", trackIndex: safeIndex });
            setAnnouncement(
              `Playing ${selected.tracks[safeIndex]?.title}. Track ${safeIndex + 1} of ${selected.tracks.length}.`,
            );
          });
          controller.addListener("playback_update", (event) => {
            const { duration, isBuffering, isPaused, playingURI, position } =
              event.data;
            const selected = selectedReleaseRef.current;
            if (!selected) return;
            const eventTrackIndex = selected.tracks.findIndex(
              (candidate) => candidate.spotifyUri === playingURI,
            );
            if (duration > 0) {
              setProgress((position / duration) * 100);
            }
            if (isBuffering && stateRef.current.releaseKey) {
              dispatch({ type: "PLAY_REQUEST" });
            } else if (!isPaused) {
              dispatch({
                type: "PLAYING",
                trackIndex:
                  eventTrackIndex >= 0
                    ? eventTrackIndex
                    : stateRef.current.trackIndex,
              });
            } else if (
              hasStartedRef.current &&
              stateRef.current.status !== "selected"
            ) {
              dispatch({ type: "PAUSE" });
            }

            const now = Date.now();
            if (now - persistedAtRef.current > 1500) {
              persistedAtRef.current = now;
              window.sessionStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                  position,
                  releaseKey: releaseKey(selected),
                  trackIndex:
                    eventTrackIndex >= 0
                      ? eventTrackIndex
                      : stateRef.current.trackIndex,
                }),
              );
            }

            if (
              duration > 0 &&
              !isPaused &&
              duration - position < 650 &&
              stateRef.current.trackIndex < selected.tracks.length - 1 &&
              autoAdvancedTrackRef.current !== playingURI
            ) {
              autoAdvancedTrackRef.current = playingURI;
              nextTrackRef.current(1);
            }
          });
        },
      );
    };

    window.onSpotifyIframeApiReady = (api) => {
      window.__wbrSpotifyIframeApi = api;
      createController(api);
    };

    if (window.__wbrSpotifyIframeApi) {
      createController(window.__wbrSpotifyIframeApi);
    } else if (
      !document.querySelector(
        'script[src="https://open.spotify.com/embed/iframe-api/v1"]',
      )
    ) {
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.addEventListener("error", () => {
        dispatch({
          type: "ERROR",
          message:
            "Spotify playback is unavailable. Open the record in Spotify.",
        });
      });
      document.body.append(script);
    }

    return () => {
      cancelled = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
      setControllerReady(false);
    };
  }, [activeRelease, enabled, spotifyHostElement]);

  useEffect(() => {
    if (!enabled) return;
    return () => {
      controllerRef.current?.destroy();
      if (needleAudioRef.current) {
        void needleAudioRef.current.close();
      }
    };
  }, [enabled]);

  const loadTrack = useCallback(
    (trackIndex: number, play: boolean) => {
      if (!enabled) return;
      const release = selectedReleaseRef.current;
      const controller = controllerRef.current;
      if (!release || !controller) return;
      const safeIndex = Math.min(
        Math.max(trackIndex, 0),
        release.tracks.length - 1,
      );
      const track = release.tracks[safeIndex];
      dispatch({ type: "TRACK_REQUEST", trackIndex: safeIndex });
      setProgress(0);
      hasStartedRef.current = false;
      controller.loadEntity(track.spotifyUri, false, 0);
      setAnnouncement(`Skipping to track ${safeIndex + 1}. ${track.title}.`);
      if (play) {
        playNeedleDrop(needleAudioRef);
        controller.play();
      } else {
        dispatch({ type: "PAUSE" });
        setAnnouncement(
          `Selected ${track.title}. Paused. Press play to lower the needle.`,
        );
      }
    },
    [enabled],
  );

  const changeTrack = useCallback(
    (direction: -1 | 1) => {
      if (!enabled) return;
      const release = selectedReleaseRef.current;
      if (!release) return;
      const nextIndex = wrappedTrackIndex(
        stateRef.current.trackIndex,
        release.tracks.length,
        direction,
      );
      const shouldContinuePlaying =
        stateRef.current.status === "playing" ||
        stateRef.current.status === "loading";
      loadTrack(nextIndex, shouldContinuePlaying);
    },
    [enabled, loadTrack],
  );

  useEffect(() => {
    nextTrackRef.current = changeTrack;
  }, [changeTrack]);

  const selectRelease = useCallback(
    (release: PlayablePublicRelease) => {
      if (!enabled) return;
      if (stateRef.current.releaseKey === releaseKey(release)) {
        dispatch({ type: "EXPAND" });
        setAnnouncement(
          `${release.title} by ${release.artistName} is already on the platter.`,
        );
        return;
      }
      controllerRef.current?.pause();
      hasStartedRef.current = false;
      setProgress(0);
      dispatch({ type: "SELECT", releaseKey: releaseKey(release) });
      setAnnouncement(`Selected ${release.title} by ${release.artistName}.`);
    },
    [enabled],
  );

  const selectTrack = useCallback(
    (trackIndex: number) => {
      if (!enabled || !selectedReleaseRef.current) return;
      const continuePlaying =
        stateRef.current.status === "playing" ||
        stateRef.current.status === "loading";
      loadTrack(trackIndex, continuePlaying);
    },
    [enabled, loadTrack],
  );

  const togglePlayback = useCallback(() => {
    if (!enabled) return;
    const release = selectedReleaseRef.current;
    const controller = controllerRef.current;
    if (!release || !controller) return;
    if (stateRef.current.status === "playing") {
      controller.pause();
      dispatch({ type: "PAUSE" });
      setAnnouncement("Paused. Press play to resume.");
      return;
    }
    dispatch({ type: "PLAY_REQUEST" });
    setAnnouncement(`Needle descending over ${release.title}.`);
    playNeedleDrop(needleAudioRef);
    controller.play();
  }, [enabled]);

  const eject = useCallback(() => {
    if (!enabled) return;
    controllerRef.current?.pause();
    hasStartedRef.current = false;
    setProgress(0);
    window.sessionStorage.removeItem(STORAGE_KEY);
    dispatch({ type: "EJECT" });
    setAnnouncement("Record returned to the collection. Platter empty.");
  }, [enabled]);

  const handleKeyboard = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (!enabled || event.target !== event.currentTarget) return;
      if (event.key === " ") {
        event.preventDefault();
        togglePlayback();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        changeTrack(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        changeTrack(-1);
      } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        setAnnouncement(
          "Volume is available in the visible Spotify controls above the turntable.",
        );
      } else if (event.key === "Escape") {
        event.preventDefault();
        dispatch({ type: "MINIMIZE" });
      }
    },
    [changeTrack, enabled, togglePlayback],
  );

  const contextValue = useMemo<TurntableContextValue>(
    () => ({
      activeRelease,
      announcement,
      controllerReady,
      enabled,
      error: state.error,
      isActiveRelease: (release) =>
        enabled && state.releaseKey === releaseKey(release),
      nextTrack: () => changeTrack(1),
      previousTrack: () => changeTrack(-1),
      progress,
      registerSpotifyHost,
      selectRelease,
      selectTrack,
      status: state.status,
      togglePlayback,
      trackIndex: state.trackIndex,
    }),
    [
      activeRelease,
      announcement,
      changeTrack,
      controllerReady,
      enabled,
      progress,
      registerSpotifyHost,
      selectRelease,
      selectTrack,
      state.error,
      state.releaseKey,
      state.status,
      state.trackIndex,
      togglePlayback,
    ],
  );

  return (
    <TurntableContext.Provider value={contextValue}>
      {children}
      {enabled && persistentPlayerEnabled ? (
        <TurntablePlayer
          announcement={announcement}
          controllerReady={controllerReady}
          error={state.error}
          minimized={state.minimized}
          onEject={eject}
          onExpand={() => dispatch({ type: "EXPAND" })}
          onKeyDown={handleKeyboard}
          onMinimize={() => dispatch({ type: "MINIMIZE" })}
          onNext={() => changeTrack(1)}
          onPrevious={() => changeTrack(-1)}
          onTogglePlayback={togglePlayback}
          progress={progress}
          release={activeRelease}
          spotifyHostRef={registerSpotifyHost}
          status={state.status}
          trackIndex={state.trackIndex}
          visible={visible}
        />
      ) : null}
    </TurntableContext.Provider>
  );
}
