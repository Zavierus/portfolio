import { CHAPTERS } from "../film/film-model.js";

export const INITIAL_FILM_UI_STATE = Object.freeze({
  phase: "idle",
  progress: 0,
  playing: false,
  muted: false,
  audioUnlocked: false,
  chapterId: CHAPTERS[0].id,
  time: 0,
  controlsVisible: true,
  error: null,
});

const clamp01 = (value) => Math.min(1, Math.max(0, Number(value) || 0));

export function reduceFilmUiState(state = INITIAL_FILM_UI_STATE, action = {}) {
  if (action.type === "LOAD_START") return { ...state, phase: "loading", progress: 0, error: null };
  if (action.type === "LOAD_PROGRESS") {
    return { ...state, phase: "loading", progress: clamp01(action.progress), error: null };
  }
  if (action.type === "READY") return { ...state, phase: "ready", progress: 1, error: null };
  if (action.type === "PLAY") return { ...state, phase: "playing", playing: true, controlsVisible: true };
  if (action.type === "PAUSE") return { ...state, phase: "paused", playing: false, controlsVisible: true };
  if (action.type === "REPLAY") {
    return { ...state, phase: "playing", playing: true, time: 0, chapterId: CHAPTERS[0].id, controlsVisible: true };
  }
  if (action.type === "MUTE") return { ...state, muted: Boolean(action.muted) };
  if (action.type === "AUDIO_UNLOCKED") return { ...state, audioUnlocked: true };
  if (action.type === "SHOW_CONTROLS") return { ...state, controlsVisible: true };
  if (action.type === "HIDE_CONTROLS") return { ...state, controlsVisible: false };
  if (action.type === "TIME") {
    return { ...state, time: Math.max(0, Number(action.time) || 0), chapterId: action.chapterId ?? state.chapterId };
  }
  if (action.type === "FINISH") return { ...state, phase: "finished", playing: false, controlsVisible: true };
  if (action.type === "ERROR") {
    return {
      ...state,
      phase: "error",
      playing: false,
      error: {
        kind: action.kind ?? "runtime",
        message: action.message || "影片无法启动",
        retryable: action.retryable !== false,
      },
    };
  }
  return state;
}
