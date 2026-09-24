import { FILM_DURATION } from "../film/film-model.js";
import { AUDIO_BUSES, sampleAudioMix } from "./audio-mix.js";

const clampTime = (value) => Math.min(FILM_DURATION, Math.max(0, Number(value) || 0));
const noOp = () => {};

function resolveAdapter(adapter = {}) {
  return {
    unlock: typeof adapter.unlock === "function" ? adapter.unlock.bind(adapter) : async () => true,
    startLoop: typeof adapter.startLoop === "function" ? adapter.startLoop.bind(adapter) : noOp,
    playOneShot: typeof adapter.playOneShot === "function" ? adapter.playOneShot.bind(adapter) : noOp,
    stopAll: typeof adapter.stopAll === "function" ? adapter.stopAll.bind(adapter) : noOp,
    setBusGain: typeof adapter.setBusGain === "function" ? adapter.setBusGain.bind(adapter) : noOp,
    setMasterGain: typeof adapter.setMasterGain === "function" ? adapter.setMasterGain.bind(adapter) : noOp,
    dispose: typeof adapter.dispose === "function" ? adapter.dispose.bind(adapter) : noOp,
  };
}

const LOOP_LAYERS = Object.freeze([
  Object.freeze({ id: "deep-field", assetId: "facility-ambience", bus: "field" }),
  Object.freeze({ id: "archive-signal", assetId: "resonance-score", bus: "signal" }),
  Object.freeze({ id: "structure-wake", assetId: "resonance-score", bus: "structure" }),
  Object.freeze({ id: "memory-samples", assetId: "breathing", bus: "memory" }),
]);

export class AudioDirector {
  constructor({ adapter, buffers = {}, muted = true, onState = noOp } = {}) {
    if (typeof onState !== "function") throw new TypeError("AudioDirector onState must be a function");
    this.adapter = resolveAdapter(adapter);
    this.buffers = buffers;
    this.onState = onState;
    this.state = {
      unlocked: false,
      unlocking: false,
      playing: false,
      muted: Boolean(muted),
      visible: true,
      filmTime: 0,
    };
    this._unlockPromise = null;
    this._resumeAfterVisibility = false;
    this._disposed = false;
  }

  start(time = this.state.filmTime) {
    this._assertUsable();
    this.state.filmTime = clampTime(time);
    if (this.state.playing) return false;
    this.state.playing = true;
    if (this.state.unlocked) this._scheduleLoops("play");
    this._applyMix();
    this._emit();
    return true;
  }

  async unlock(time = this.state.filmTime) {
    this._assertUsable();
    this.state.filmTime = clampTime(time);
    if (this.state.unlocked) return true;
    if (this._unlockPromise) return this._unlockPromise;
    this.state.unlocking = true;
    this._emit();
    this._unlockPromise = Promise.resolve(this.adapter.unlock()).then(() => {
      this.state.unlocked = true;
      this.state.unlocking = false;
      if (this.state.playing) this._scheduleLoops("unlock");
      this._applyMix();
      this._emit();
      return true;
    }).catch((error) => {
      this.state.unlocking = false;
      this._unlockPromise = null;
      this._emit();
      throw error;
    });
    return this._unlockPromise;
  }

  pause(reason = "pause") {
    this._assertUsable();
    if (!this.state.playing) return false;
    this.state.playing = false;
    if (this.state.unlocked) this.adapter.stopAll(reason);
    this._emit();
    return true;
  }

  resume(time = this.state.filmTime) {
    return this.start(time);
  }

  seek(time, reason = "seek") {
    this._assertUsable();
    this.state.filmTime = clampTime(time);
    if (this.state.unlocked && this.state.playing) {
      this.adapter.stopAll(reason);
      this._scheduleLoops(reason);
    }
    this._applyMix();
    this._emit();
    return this.snapshot();
  }

  update(time) {
    this._assertUsable();
    this.state.filmTime = clampTime(time);
    this._applyMix();
    return this.snapshot();
  }

  finish() {
    this._assertUsable();
    if (this.state.unlocked) this.adapter.stopAll("finish");
    this.state.playing = false;
    this.state.filmTime = FILM_DURATION;
    this._applyMix();
    this._emit();
    return true;
  }

  setMuted(muted) {
    this._assertUsable();
    const next = Boolean(muted);
    if (next === this.state.muted) return false;
    this.state.muted = next;
    this._applyMix();
    this._emit();
    return true;
  }

  setVisibility(visible) {
    this._assertUsable();
    const next = Boolean(visible);
    if (next === this.state.visible) return false;
    this.state.visible = next;
    if (!next) {
      this._resumeAfterVisibility = this.state.playing;
      this.pause("visibility");
    } else if (this._resumeAfterVisibility) {
      this._resumeAfterVisibility = false;
      this.resume();
    }
    this._emit();
    return true;
  }

  handleFilmEvent(event = {}) {
    if (event.type === "play") return this.start(event.time);
    if (event.type === "pause") return this.pause(event.reason);
    if (event.type === "seek") return this.seek(event.time);
    if (event.type === "replay") return this.seek(0, "replay");
    if (event.type === "finish") return this.finish();
    return false;
  }

  snapshot() {
    return Object.freeze({ ...this.state });
  }

  dispose() {
    if (this._disposed) return false;
    this.adapter.stopAll("dispose");
    this.adapter.dispose();
    this._disposed = true;
    return true;
  }

  _scheduleLoops(reason) {
    for (const layer of LOOP_LAYERS) {
      const assetId = layer.assetId ?? layer.id;
      const buffer = this.buffers[assetId];
      if (!buffer) continue;
      this.adapter.startLoop({
        id: layer.id,
        assetId,
        buffer,
        bus: layer.bus,
        filmTime: this.state.filmTime,
        offset: this.state.filmTime,
        reason,
      });
    }
  }

  _applyMix() {
    const mix = sampleAudioMix(this.state.filmTime, { muted: this.state.muted });
    this.adapter.setMasterGain(mix.master, this.state.filmTime);
    for (const bus of AUDIO_BUSES) this.adapter.setBusGain(bus, mix.buses[bus], this.state.filmTime);
    return mix;
  }

  _emit() {
    this.onState(this.snapshot());
  }

  _assertUsable() {
    if (this._disposed) throw new Error("AudioDirector has been disposed");
  }
}

export function createAudioDirector(options) {
  return new AudioDirector(options);
}
