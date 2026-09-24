import { createVjSignal } from "./vj-signal.js";

export class AnalysisClientError extends Error {
  constructor(code, message, details = {}, cause) {
    super(message, cause ? { cause } : undefined);
    this.name = "AnalysisClientError";
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

export class AnalysisClient {
  constructor({
    fetchImpl = globalThis.fetch?.bind(globalThis),
    workerFactory = () => new Worker("./analysis-worker.bundle.js"),
    onProgress = () => {},
  } = {}) {
    if (typeof onProgress !== "function") throw new TypeError("onProgress must be a function");
    this.fetchImpl = fetchImpl;
    this.workerFactory = workerFactory;
    this.onProgress = onProgress;
    this.analyses = new Map();
    this.trackBpms = new Map();
    this.pending = new Map();
    this.worker = null;
    this.requestSequence = 0;
    this._state = { status: "idle", trackId: null, progress: 0, error: null };
  }

  get state() {
    return Object.freeze({ ...this._state });
  }

  async loadTrack(track) {
    if (!track?.id || !track.analysisUrl || typeof this.fetchImpl !== "function") {
      return this._fallback(track?.id, "PRECOMPUTED_LOAD_FAILED", "Track analysis metadata is unavailable");
    }
    this.trackBpms.set(track.id, Number(track.bpm) || 0);
    this._state = { status: "loading", trackId: track.id, progress: 0, error: null };
    try {
      const response = await this.fetchImpl(track.analysisUrl);
      if (!response?.ok) throw new Error(`Analysis request returned ${response?.status ?? "unknown"}`);
      const analysis = await response.json();
      if (!analysis || !Number.isFinite(Number(analysis.bpm))) throw new Error("Analysis payload has no finite BPM");
      this.analyses.set(track.id, analysis);
      this._state = { status: "ready", trackId: track.id, progress: 1, error: null };
      return Object.freeze({ status: "ready", analysis });
    } catch (error) {
      return this._fallback(track.id, "PRECOMPUTED_LOAD_FAILED", "Precomputed track analysis could not be loaded", error);
    }
  }

  sample({ trackId, time = 0, realtime = {} } = {}) {
    return createVjSignal({
      time,
      realtime,
      analysis: this.analyses.get(trackId) ?? null,
      fallbackBpm: this.trackBpms.get(trackId) ?? null,
    });
  }

  async analyzePcm({ trackId, pcm, sampleRate, style = null }) {
    if (!(pcm instanceof Float32Array) || pcm.length === 0) {
      throw new TypeError("Imported analysis requires a non-empty Float32Array");
    }
    if (!Number.isFinite(Number(sampleRate)) || Number(sampleRate) <= 0) {
      throw new TypeError("Imported analysis requires a positive sample rate");
    }
    const worker = this._ensureWorker();
    const requestId = `pulse-analysis-${++this.requestSequence}`;
    this._state = { status: "analyzing", trackId, progress: 0, error: null };
    const result = new Promise((resolve, reject) => this.pending.set(requestId, { resolve, reject, trackId }));
    worker.postMessage({ type: "analyze", requestId, trackId, pcm, sampleRate: Number(sampleRate), style }, [pcm.buffer]);
    return result;
  }

  dispose() {
    for (const { reject } of this.pending.values()) {
      reject(new AnalysisClientError("DISPOSED", "Analysis client was disposed"));
    }
    this.pending.clear();
    this.worker?.terminate();
    this.worker = null;
    this._state = { status: "disposed", trackId: null, progress: 0, error: null };
  }

  _ensureWorker() {
    if (this.worker) return this.worker;
    const worker = this.workerFactory();
    if (!worker || typeof worker.postMessage !== "function") throw new TypeError("workerFactory must return a Worker");
    worker.addEventListener("message", (event) => this._handleWorkerMessage(event.data));
    worker.addEventListener?.("error", (event) => this._handleWorkerFailure(event.error ?? new Error(event.message)));
    this.worker = worker;
    return worker;
  }

  _handleWorkerMessage(message) {
    const pending = this.pending.get(message?.requestId);
    if (!pending) return;
    if (message.type === "progress") {
      const progress = Math.min(1, Math.max(0, Number(message.progress) || 0));
      this._state = { status: "analyzing", trackId: pending.trackId, progress, error: null };
      this.onProgress(Object.freeze({ trackId: pending.trackId, progress }));
      return;
    }
    this.pending.delete(message.requestId);
    if (message.type === "result") {
      this.analyses.set(pending.trackId, message.analysis);
      this._state = { status: "ready", trackId: pending.trackId, progress: 1, error: null };
      pending.resolve(Object.freeze({ status: "ready", analysis: message.analysis }));
      return;
    }
    const error = new AnalysisClientError(
      message.code ?? "WORKER_ANALYSIS_FAILED",
      message.message ?? "Imported audio analysis failed",
      { trackId: pending.trackId },
    );
    this._state = { status: "fallback", trackId: pending.trackId, progress: 0, error };
    pending.resolve(Object.freeze({ status: "fallback", error }));
  }

  _handleWorkerFailure(cause) {
    for (const [requestId, pending] of this.pending) {
      this.pending.delete(requestId);
      const result = this._fallback(pending.trackId, "WORKER_ANALYSIS_FAILED", "Analysis worker stopped unexpectedly", cause);
      pending.resolve(result);
    }
  }

  _fallback(trackId, code, message, cause) {
    const error = new AnalysisClientError(code, message, { trackId }, cause);
    this._state = { status: "fallback", trackId: trackId ?? null, progress: 0, error };
    return Object.freeze({ status: "fallback", error });
  }
}
