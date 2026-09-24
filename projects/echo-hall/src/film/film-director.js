import { chapterAtTime } from "./film-model.js";

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, Number(value) || 0));

export class FilmDirector {
  constructor({ duration, chapters, onEvent = () => {} }) {
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new TypeError("Film duration must be a positive finite number");
    }
    if (!Array.isArray(chapters) || chapters.length === 0) {
      throw new TypeError("Film chapters must be a non-empty array");
    }
    if (typeof onEvent !== "function") {
      throw new TypeError("Film onEvent must be a function");
    }

    this.duration = duration;
    this.chapters = [...chapters];
    this.onEvent = onEvent;
    this._state = {
      time: 0,
      playing: false,
      chapterId: chapterAtTime(this.chapters, 0)?.id ?? null,
      completed: false,
    };
  }

  get state() {
    return { ...this._state };
  }

  getState() {
    return this.state;
  }

  play() {
    if (this._state.playing || this._state.completed) return false;
    this._state.playing = true;
    this._emit("play");
    return true;
  }

  pause(reason) {
    if (!this._state.playing) return false;
    this._state.playing = false;
    this._emit("pause", reason ? { reason } : undefined);
    return true;
  }

  tick(delta) {
    const elapsed = Number(delta);
    if (!this._state.playing || !Number.isFinite(elapsed) || elapsed <= 0) return false;

    const target = Math.min(this.duration, this._state.time + elapsed);
    this._advanceTo(target);
    if (target >= this.duration) {
      this._state.playing = false;
      this._state.completed = true;
      this._emit("finish");
    }
    return true;
  }

  seek(time) {
    const nextTime = clamp(time, 0, this.duration);
    const fromChapterId = this._state.chapterId;
    this._state.time = nextTime;
    this._state.chapterId = chapterAtTime(this.chapters, nextTime)?.id ?? null;
    this._state.completed = nextTime >= this.duration;
    this._emit("seek");
    this._emitChapterChange(fromChapterId);
    return this.state;
  }

  replay() {
    const fromChapterId = this._state.chapterId;
    this._state.time = 0;
    this._state.playing = false;
    this._state.completed = false;
    this._state.chapterId = chapterAtTime(this.chapters, 0)?.id ?? null;
    this._emit("replay");
    this._emitChapterChange(fromChapterId);
    this.play();
    return this.state;
  }

  setVisibility(isVisible) {
    if (isVisible) return false;
    return this.pause("visibility");
  }

  _advanceTo(time) {
    for (const chapter of this.chapters) {
      if (chapter.start <= this._state.time || chapter.start > time) continue;
      const fromChapterId = this._state.chapterId;
      this._state.time = chapter.start;
      this._state.chapterId = chapter.id;
      this._emitChapterChange(fromChapterId);
    }
    this._state.time = time;
  }

  _emitChapterChange(fromChapterId) {
    if (fromChapterId === this._state.chapterId) return;
    this._emit("chapterchange", { fromChapterId });
  }

  _emit(type, details = {}) {
    this.onEvent({ type, ...this.state, ...details });
  }
}
