export type TurntableStatus =
  | "idle"
  | "selected"
  | "loading"
  | "playing"
  | "paused"
  | "error";

export interface TurntableMachineState {
  error: string | null;
  minimized: boolean;
  releaseKey: string | null;
  status: TurntableStatus;
  trackIndex: number;
}

export type TurntableMachineAction =
  | { type: "SELECT"; releaseKey: string }
  | { type: "RESTORE"; releaseKey: string; trackIndex: number }
  | { type: "PLAY_REQUEST" }
  | { type: "PLAYING"; trackIndex?: number }
  | { type: "PAUSE" }
  | { type: "TRACK_REQUEST"; trackIndex: number }
  | { type: "MINIMIZE" }
  | { type: "EXPAND" }
  | { type: "ERROR"; message: string }
  | { type: "EJECT" };

export const initialTurntableState: TurntableMachineState = {
  error: null,
  minimized: false,
  releaseKey: null,
  status: "idle",
  trackIndex: 0,
};

export function wrappedTrackIndex(
  current: number,
  trackCount: number,
  direction: -1 | 1,
) {
  if (trackCount <= 0) return 0;
  return (current + direction + trackCount) % trackCount;
}

export function turntableReducer(
  state: TurntableMachineState,
  action: TurntableMachineAction,
): TurntableMachineState {
  switch (action.type) {
    case "SELECT":
      return {
        error: null,
        minimized: false,
        releaseKey: action.releaseKey,
        status: "selected",
        trackIndex: 0,
      };
    case "RESTORE":
      return {
        error: null,
        minimized: false,
        releaseKey: action.releaseKey,
        status: "paused",
        trackIndex: Math.max(0, action.trackIndex),
      };
    case "PLAY_REQUEST":
      return state.releaseKey
        ? { ...state, error: null, status: "loading" }
        : state;
    case "PLAYING":
      return state.releaseKey
        ? {
            ...state,
            error: null,
            status: "playing",
            trackIndex: action.trackIndex ?? state.trackIndex,
          }
        : state;
    case "PAUSE":
      return state.releaseKey ? { ...state, status: "paused" } : state;
    case "TRACK_REQUEST":
      return state.releaseKey
        ? {
            ...state,
            error: null,
            status: "loading",
            trackIndex: Math.max(0, action.trackIndex),
          }
        : state;
    case "MINIMIZE":
      return { ...state, minimized: true };
    case "EXPAND":
      return { ...state, minimized: false };
    case "ERROR":
      return { ...state, error: action.message, status: "error" };
    case "EJECT":
      return initialTurntableState;
    default:
      return state;
  }
}
