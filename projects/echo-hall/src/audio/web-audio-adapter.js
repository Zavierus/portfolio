import { AUDIO_BUSES } from "./audio-mix.js";

export class WebAudioAdapter {
  constructor({ rawBuffers = {}, AudioContextClass } = {}) {
    this.rawBuffers = rawBuffers;
    this.AudioContextClass = AudioContextClass
      ?? globalThis.AudioContext
      ?? globalThis.webkitAudioContext;
    this.context = null;
    this.master = null;
    this.buses = {};
    this.buffers = {};
    this.sources = new Set();
  }

  async unlock() {
    if (!this.AudioContextClass) throw new Error("Web Audio is unavailable");
    if (!this.context) {
      this.context = new this.AudioContextClass();
      this.master = this.context.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.context.destination);
      for (const bus of AUDIO_BUSES) {
        const node = this.context.createGain();
        node.gain.value = 0;
        node.connect(this.master);
        this.buses[bus] = node;
      }
    }
    if (this.context.state === "suspended") await this.context.resume();
    const entries = Object.entries(this.rawBuffers);
    await Promise.all(entries.map(async ([id, raw]) => {
      if (this.buffers[id] || !(raw instanceof ArrayBuffer)) return;
      this.buffers[id] = await this.context.decodeAudioData(raw.slice(0));
    }));
    return true;
  }

  startLoop({ id, assetId = id, buffer, bus, offset = 0 }) {
    const decoded = this.buffers[assetId] ?? this.buffers[buffer?.id] ?? this.buffers[buffer];
    if (!this.context || !decoded || !this.buses[bus]) return false;
    const source = this.context.createBufferSource();
    source.buffer = decoded;
    source.loop = true;
    source.connect(this.buses[bus]);
    const safeOffset = decoded.duration > 0 ? Math.max(0, offset) % decoded.duration : 0;
    source.start(this.context.currentTime, safeOffset);
    this._track(source);
    return source;
  }

  playOneShot({ buffer, bus, gain = 1, playbackRate = 1 }) {
    const decoded = this.buffers[buffer?.id] ?? this.buffers[buffer] ?? this.buffers.footsteps;
    if (!this.context || !decoded || !this.buses[bus]) return false;
    const source = this.context.createBufferSource();
    const level = this.context.createGain();
    source.buffer = decoded;
    source.playbackRate.value = playbackRate;
    level.gain.value = gain;
    source.connect(level).connect(this.buses[bus]);
    source.start();
    this._track(source);
    return source;
  }

  stopAll() {
    for (const source of this.sources) {
      try { source.stop(); } catch { /* source already ended */ }
      source.disconnect();
    }
    this.sources.clear();
  }

  setBusGain(bus, gain) {
    const node = this.buses[bus];
    if (!node || !this.context) return;
    node.gain.setTargetAtTime(Math.max(0, gain), this.context.currentTime, 0.045);
  }

  setMasterGain(gain) {
    if (!this.master || !this.context) return;
    this.master.gain.setTargetAtTime(Math.max(0, gain), this.context.currentTime, 0.025);
  }

  async dispose() {
    this.stopAll();
    if (this.context && this.context.state !== "closed") await this.context.close();
  }

  _track(source) {
    this.sources.add(source);
    source.addEventListener("ended", () => this.sources.delete(source), { once: true });
  }
}
