import assert from "node:assert/strict";
import test from "node:test";
import { INITIAL_FILM_UI_STATE, reduceFilmUiState } from "../src/ui/ui-state.js";

test("film UI starts at the one-action title state", () => {
  assert.equal(INITIAL_FILM_UI_STATE.phase, "idle");
  assert.equal(INITIAL_FILM_UI_STATE.progress, 0);
  assert.equal(INITIAL_FILM_UI_STATE.chapterId, "greeting");
});

test("loading progress clamps before ready", () => {
  const loading = reduceFilmUiState(INITIAL_FILM_UI_STATE, { type: "LOAD_PROGRESS", progress: 1.5 });
  assert.equal(loading.progress, 1);
  const ready = reduceFilmUiState(loading, { type: "READY" });
  assert.equal(ready.phase, "ready");
});

test("play, pause, mute, and audio unlock remain independent", () => {
  let state = reduceFilmUiState(INITIAL_FILM_UI_STATE, { type: "READY" });
  state = reduceFilmUiState(state, { type: "PLAY" });
  state = reduceFilmUiState(state, { type: "MUTE", muted: false });
  state = reduceFilmUiState(state, { type: "AUDIO_UNLOCKED" });
  assert.equal(state.playing, true);
  assert.equal(state.muted, false);
  assert.equal(state.audioUnlocked, true);
  const paused = reduceFilmUiState(state, { type: "PAUSE" });
  assert.equal(paused.playing, false);
  assert.equal(paused.phase, "paused");
});

test("time updates chapter labels without changing playback", () => {
  const state = reduceFilmUiState(
    { ...INITIAL_FILM_UI_STATE, playing: true },
    { type: "TIME", time: 51, chapterId: "recognition" },
  );
  assert.equal(state.time, 51);
  assert.equal(state.chapterId, "recognition");
  assert.equal(state.playing, true);
});

test("finish exposes replay while critical errors expose recovery", () => {
  const finished = reduceFilmUiState({ ...INITIAL_FILM_UI_STATE, playing: true }, { type: "FINISH" });
  assert.equal(finished.phase, "finished");
  const failed = reduceFilmUiState(finished, {
    type: "ERROR",
    kind: "asset",
    message: "角色载入失败",
    retryable: true,
  });
  assert.equal(failed.phase, "error");
  assert.equal(failed.error.kind, "asset");
  assert.equal(failed.error.retryable, true);
});

test("WebGL failure can disable retry while keeping a clear reason", () => {
  const state = reduceFilmUiState(INITIAL_FILM_UI_STATE, {
    type: "ERROR",
    kind: "webgl",
    message: "当前浏览器无法创建 WebGL 画面",
    retryable: false,
  });
  assert.equal(state.error.retryable, false);
  assert.match(state.error.message, /WebGL/);
});
