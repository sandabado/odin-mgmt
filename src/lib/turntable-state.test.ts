import { describe, expect, it } from "vitest";
import {
  initialTurntableState,
  turntableReducer,
  wrappedTrackIndex,
} from "./turntable-state";

describe("turntable state machine", () => {
  it("moves from idle through selection, loading, playing, and pause", () => {
    const selected = turntableReducer(initialTurntableState, {
      type: "SELECT",
      releaseKey: "sandabado-333",
    });
    expect(selected.status).toBe("selected");

    const loading = turntableReducer(selected, { type: "PLAY_REQUEST" });
    expect(loading.status).toBe("loading");

    const playing = turntableReducer(loading, { type: "PLAYING" });
    expect(playing.status).toBe("playing");

    const paused = turntableReducer(playing, { type: "PAUSE" });
    expect(paused.status).toBe("paused");
  });

  it("wraps track navigation in either direction", () => {
    expect(wrappedTrackIndex(3, 4, 1)).toBe(0);
    expect(wrappedTrackIndex(0, 4, -1)).toBe(3);
  });

  it("does not start playback or track changes on an empty platter", () => {
    expect(
      turntableReducer(initialTurntableState, { type: "PLAY_REQUEST" }),
    ).toEqual(initialTurntableState);
    expect(
      turntableReducer(initialTurntableState, {
        type: "TRACK_REQUEST",
        trackIndex: 2,
      }),
    ).toEqual(initialTurntableState);
  });

  it("restores safely and accepts an explicit playing track", () => {
    const restored = turntableReducer(initialTurntableState, {
      type: "RESTORE",
      releaseKey: "sandabado-333",
      trackIndex: -3,
    });
    expect(restored.trackIndex).toBe(0);
    expect(restored.status).toBe("paused");

    const playing = turntableReducer(restored, {
      type: "PLAYING",
      trackIndex: 2,
    });
    expect(playing.trackIndex).toBe(2);
    expect(playing.status).toBe("playing");
  });

  it("ejects back to a clean idle state", () => {
    const selected = turntableReducer(initialTurntableState, {
      type: "SELECT",
      releaseKey: "sandabado-333",
    });
    expect(turntableReducer(selected, { type: "EJECT" })).toEqual(
      initialTurntableState,
    );
  });
});
