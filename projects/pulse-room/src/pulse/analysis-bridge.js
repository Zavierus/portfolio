import { createVjSignal } from "../analysis/vj-signal.js";

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.min(1, Math.max(0, finite(value)));

function freezeState(state) {
  return Object.freeze({ ...state });
}

function realtimePayload(realtime = {}) {
  const peak = realtime.peak ?? realtime.energy;
  return {
    energy: clamp01(peak),
    peak: clamp01(peak),
    low: clamp01(realtime.low),
    mid: clamp01(realtime.mid),
    high: clamp01(realtime.high),
    onset: clamp01(realtime.onset),
    spectralCentroid: clamp01(realtime.spectralCentroid),
  };
}

function normalizeSignal(signal, { source, playing, serial }) {
  const normalized = {
    time: Math.max(0, finite(signal?.time)),
    beatPhase: clamp01(signal?.beatPhase),
    barPhase: clamp01(signal?.barPhase),
    section: typeof signal?.section === "string" && signal.section ? signal.section : "realtime",
    energy: playing ? clamp01(signal?.energy ?? signal?.peak) : 0,
    peak: playing ? clamp01(signal?.peak ?? signal?.energy) : 0,
    low: playing ? clamp01(signal?.low) : 0,
    mid: playing ? clamp01(signal?.mid) : 0,
    high: playing ? clamp01(signal?.high) : 0,
    onset: playing ? clamp01(signal?.onset) : 0,
    spectralCentroid: clamp01(signal?.spectralCentroid),
    cameraEvent: playing ? signal?.cameraEvent ?? null : null,
    particleEvent: playing ? signal?.particleEvent ?? null : null,
    source,
    serial,
  };
  return Object.freeze(normalized);
}

export function createAnalysisBridge({
  fetchImpl = globalThis.fetch?.bind(globalThis),
  signalFactory = createVjSignal,
  analysisByTrack = null,
} = {}) {
  if (typeof signalFactory !== "function") throw new TypeError("signalFactory must be a function");

  let serial = 0;
  let selectedTrack = null;
  let selectedAnalysis = null;
  let state = freezeState({
    status: "idle",
    trackId: null,
    source: "realtime",
    serial,
    error: null,
  });
  let lastFrameKey = null;
  let lastFrame = null;
  let lastCameraEventKey = null;
  let lastParticleEventKey = null;

  function resetFrameCache() {
    lastFrameKey = null;
    lastFrame = null;
  }

  function resetEventHistory() {
    lastCameraEventKey = null;
    lastParticleEventKey = null;
  }

  async function select(track = {}) {
    const selectionSerial = ++serial;
    const trackId = typeof track.id === "string" && track.id ? track.id : null;
    selectedTrack = trackId ? { ...track } : null;
    selectedAnalysis = null;
    resetFrameCache();
    resetEventHistory();

    if (!trackId || track.local === true || !track.analysisUrl || typeof fetchImpl !== "function") {
      state = freezeState({
        status: "realtime",
        trackId,
        source: "realtime",
        serial: selectionSerial,
        error: null,
      });
      return state;
    }

    state = freezeState({
      status: "loading",
      trackId,
      source: "realtime",
      serial: selectionSerial,
      error: null,
    });
    try {
      const bundledAnalysis = analysisByTrack && typeof analysisByTrack === "object"
        ? analysisByTrack[trackId]
        : null;
      let analysis = bundledAnalysis;
      if (!analysis) {
        const response = await fetchImpl(track.analysisUrl);
        if (!response?.ok) throw new Error(`Analysis request returned ${response?.status ?? "unknown"}`);
        analysis = await response.json();
      }
      if (!analysis || !Number.isFinite(Number(analysis.bpm))) {
        throw new Error("Analysis payload has no finite BPM");
      }
      if (selectionSerial !== serial) return freezeState({
        status: "stale",
        trackId,
        source: "realtime",
        serial: selectionSerial,
        error: null,
      });
      selectedAnalysis = analysis;
      resetFrameCache();
      state = freezeState({
        status: "ready",
        trackId,
        source: "offline+realtime",
        serial: selectionSerial,
        error: null,
      });
      return state;
    } catch (error) {
      if (selectionSerial !== serial) return freezeState({
        status: "stale",
        trackId,
        source: "realtime",
        serial: selectionSerial,
        error: null,
      });
      selectedAnalysis = null;
      state = freezeState({
        status: "fallback",
        trackId,
        source: "realtime",
        serial: selectionSerial,
        error,
      });
      return state;
    }
  }

  function sample({
    trackId = selectedTrack?.id ?? null,
    currentTime = 0,
    realtime = {},
    playing = true,
    frameId = null,
  } = {}) {
    const frameKey = frameId === null || frameId === undefined
      ? null
      : `${serial}:${String(frameId)}:${String(trackId)}`;
    if (frameKey !== null && frameKey === lastFrameKey && lastFrame) return lastFrame;

    const ownsAnalysis = Boolean(
      selectedAnalysis
      && selectedTrack
      && trackId === selectedTrack.id
      && state.status === "ready"
    );
    const live = realtimePayload(realtime);
    const rawSignal = signalFactory({
      time: currentTime,
      realtime: live,
      analysis: ownsAnalysis ? selectedAnalysis : null,
      fallbackBpm: selectedTrack?.bpm ?? null,
    });
    let normalized = normalizeSignal(rawSignal, {
      source: ownsAnalysis ? "offline+realtime" : "realtime",
      playing: Boolean(playing),
      serial,
    });
    if (playing) {
      const cameraKey = normalized.cameraEvent
        ? `${normalized.cameraEvent.time}:${normalized.cameraEvent.type}`
        : null;
      const particleKey = normalized.particleEvent
        ? `${normalized.particleEvent.time}:${normalized.particleEvent.type}`
        : null;
      normalized = Object.freeze({
        ...normalized,
        cameraEvent: cameraKey && cameraKey !== lastCameraEventKey ? normalized.cameraEvent : null,
        particleEvent: particleKey && particleKey !== lastParticleEventKey ? normalized.particleEvent : null,
      });
      if (cameraKey) lastCameraEventKey = cameraKey;
      if (particleKey) lastParticleEventKey = particleKey;
    }

    if (frameKey !== null) {
      lastFrameKey = frameKey;
      lastFrame = normalized;
    }
    return normalized;
  }

  function seek() {
    resetFrameCache();
    resetEventHistory();
  }

  function dispose() {
    serial += 1;
    selectedTrack = null;
    selectedAnalysis = null;
    resetFrameCache();
    resetEventHistory();
    state = freezeState({
      status: "disposed",
      trackId: null,
      source: "realtime",
      serial,
      error: null,
    });
  }

  return Object.freeze({
    select,
    sample,
    seek,
    dispose,
    get state() {
      return state;
    },
  });
}
