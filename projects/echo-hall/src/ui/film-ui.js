import { CHAPTERS, FILM_DURATION } from "../film/film-model.js";
import { INITIAL_FILM_UI_STATE, reduceFilmUiState } from "./ui-state.js";

export function formatTime(time) {
  const seconds = Math.max(0, Math.min(FILM_DURATION, Number(time) || 0));
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

export class FilmUI {
  constructor({ document: documentRef = document, onIntent = () => {} } = {}) {
    if (typeof onIntent !== "function") throw new TypeError("FilmUI onIntent must be a function");
    this.document = documentRef;
    this.onIntent = onIntent;
    this.state = { ...INITIAL_FILM_UI_STATE };
    this.hideTimer = 0;
    this.elements = {
      body: documentRef.body,
      intro: documentRef.getElementById("filmIntro"),
      loader: documentRef.getElementById("filmLoader"),
      progress: documentRef.getElementById("loadProgress"),
      progressValue: documentRef.getElementById("loadProgressValue"),
      status: documentRef.getElementById("filmStatus"),
      chapter: documentRef.getElementById("chapterLabel"),
      time: documentRef.getElementById("filmTime"),
      play: documentRef.getElementById("playButton"),
      sound: documentRef.getElementById("soundButton"),
      exit: documentRef.getElementById("exitButton"),
      controls: documentRef.getElementById("filmControls"),
      end: documentRef.getElementById("filmEnd"),
      replay: documentRef.getElementById("replayButton"),
      error: documentRef.getElementById("filmError"),
      errorMessage: documentRef.getElementById("filmErrorMessage"),
      retry: documentRef.getElementById("retryButton"),
      credits: documentRef.getElementById("creditsDialog"),
      creditsButton: documentRef.getElementById("creditsButton"),
    };
    this._bind();
    this.render();
  }

  dispatch(action) {
    this.state = reduceFilmUiState(this.state, action);
    this.render();
    return this.state;
  }

  render() {
    const { elements, state } = this;
    elements.body.dataset.filmPhase = state.phase;
    elements.body.dataset.playing = String(state.playing);
    elements.body.dataset.muted = String(state.muted);
    if (elements.intro) elements.intro.hidden = !["idle", "ready"].includes(state.phase);
    if (elements.loader) elements.loader.hidden = state.phase !== "loading";
    if (elements.end) elements.end.hidden = state.phase !== "finished";
    if (elements.controls) {
      const active = ["playing", "paused"].includes(state.phase) && state.controlsVisible;
      elements.controls.hidden = !active;
    }
    if (elements.progress) elements.progress.style.transform = `scaleX(${state.progress})`;
    if (elements.progressValue) elements.progressValue.textContent = `${Math.round(state.progress * 100)}%`;
    if (elements.status) elements.status.textContent = state.error?.message ?? "读取人类档案";
    const chapter = CHAPTERS.find(({ id }) => id === state.chapterId) ?? CHAPTERS[0];
    if (elements.chapter) elements.chapter.textContent = chapter.label;
    if (elements.time) elements.time.textContent = formatTime(state.time);
    if (elements.sound) {
      elements.sound.textContent = state.muted ? "○" : "●";
      elements.sound.setAttribute("aria-label", state.muted ? "开启声音" : "关闭声音");
      elements.sound.title = state.muted ? "开启声音" : "关闭声音";
    }
    if (elements.error) elements.error.hidden = state.phase !== "error";
    if (elements.errorMessage) elements.errorMessage.textContent = state.error?.message ?? "";
    if (elements.retry) elements.retry.hidden = state.error?.retryable === false;
  }

  _bind() {
    this.elements.play?.addEventListener("click", () => this.onIntent({ type: "play" }));
    this.elements.sound?.addEventListener("click", () => this.onIntent({ type: "toggle-sound" }));
    this.elements.exit?.addEventListener("click", () => this.onIntent({ type: "exit" }));
    this.elements.replay?.addEventListener("click", () => this.onIntent({ type: "replay" }));
    this.elements.retry?.addEventListener("click", () => this.onIntent({ type: "retry" }));
    this.elements.creditsButton?.addEventListener("click", () => {
      if (typeof this.elements.credits?.showModal === "function") this.elements.credits.showModal();
      else this.elements.credits?.setAttribute("open", "");
    });
    const showControls = () => {
      if (!["playing", "paused"].includes(this.state.phase)) return;
      this.dispatch({ type: "SHOW_CONTROLS" });
      clearTimeout(this.hideTimer);
      if (this.state.playing) this.hideTimer = setTimeout(() => this.dispatch({ type: "HIDE_CONTROLS" }), 2200);
    };
    for (const event of ["pointermove", "pointerdown", "keydown"]) {
      this.document.addEventListener(event, showControls, { passive: true });
    }
  }
}

export function createFilmUI(options) {
  return new FilmUI(options);
}
