import assert from "node:assert/strict";
import test from "node:test";

import { createAnalysisBridge } from "../src/pulse/analysis-bridge.js";

const offline = Object.freeze({
  trackId: "built-in",
  bpm: 120,
  beatOffset: 0,
  sections: [
    { id: "intro", start: 0, end: 2 },
    { id: "drive", start: 2, end: 8 },
  ],
  frames: [
    { time: 0, energy: 0.2, low: 0.4, mid: 0.2, high: 0.1, onset: 0.1, spectralCentroid: 0.2 },
    { time: 4, energy: 0.8, low: 0.7, mid: 0.6, high: 0.5, onset: 0.9, spectralCentroid: 0.8 },
  ],
  cameraEvents: [
    { time: 2, gesture: "bounded-push", intensity: 0.7, sectionId: "drive" },
  ],
  particleEvents: [
    { time: 2, type: "section", intensity: 0.6, sectionId: "drive" },
  ],
});

function response(payload, ok = true) {
  return {
    ok,
    status: ok ? 200 : 500,
    async json() {
      return payload;
    },
  };
}

function deferred() {
  let resolve;
  const promise = new Promise((next) => {
    resolve = next;
  });
  return { promise, resolve };
}

test("built-in analysis merges offline and realtime into one finite normalized frame", async () => {
  const bridge = createAnalysisBridge({
    fetchImpl: async () => response(offline),
  });
  const selected = await bridge.select({
    id: "built-in",
    bpm: 120,
    analysisUrl: "./built-in.json",
  });
  assert.equal(selected.status, "ready");

  const signal = bridge.sample({
    trackId: "built-in",
    currentTime: 2,
    playing: true,
    frameId: 7,
    realtime: {
      low: 0.9,
      mid: 0.7,
      high: 0.6,
      peak: 0.8,
      onset: 0.75,
      spectralCentroid: 0.65,
    },
  });

  for (const field of [
    "low",
    "mid",
    "high",
    "peak",
    "onset",
    "spectralCentroid",
    "beatPhase",
    "barPhase",
  ]) {
    assert.ok(Number.isFinite(signal[field]), `${field} must be finite`);
    assert.ok(signal[field] >= 0 && signal[field] <= 1, `${field} must be normalized`);
  }
  assert.equal(signal.source, "offline+realtime");
  assert.equal(signal.serial, selected.serial);
  assert.equal(signal.section, "drive");
  assert.deepEqual(signal.cameraEvent, {
    time: 2,
    type: "bounded-push",
    intensity: 0.7,
    sectionId: "drive",
  });
  assert.deepEqual(signal.particleEvent, {
    time: 2,
    type: "section",
    intensity: 0.6,
    sectionId: "drive",
  });
});

test("bundled file-mode analysis bypasses fetch and keeps the visual signal live", async () => {
  const fetches = [];
  const bridge = createAnalysisBridge({
    fetchImpl: async (url) => {
      fetches.push(url);
      throw new TypeError("file fetch is unsupported");
    },
    analysisByTrack: { "built-in": offline },
  });

  const selected = await bridge.select({
    id: "built-in",
    bpm: 120,
    analysisUrl: "./built-in.json",
  });
  const signal = bridge.sample({
    trackId: "built-in",
    currentTime: 2,
    playing: true,
    frameId: 1,
  });

  assert.equal(selected.status, "ready");
  assert.equal(signal.source, "offline+realtime");
  assert.ok(signal.peak > 0);
  assert.ok(signal.low > 0);
  assert.deepEqual(fetches, []);
});

test("selection serial prevents stale analysis from mounting over a newer track", async () => {
  const first = deferred();
  const second = deferred();
  const bridge = createAnalysisBridge({
    fetchImpl(url) {
      return url.includes("first") ? first.promise : second.promise;
    },
  });

  const firstSelection = bridge.select({ id: "first", bpm: 100, analysisUrl: "./first.json" });
  const secondSelection = bridge.select({ id: "second", bpm: 110, analysisUrl: "./second.json" });
  second.resolve(response({ ...offline, trackId: "second", bpm: 110 }));
  assert.equal((await secondSelection).status, "ready");
  first.resolve(response({ ...offline, trackId: "first", bpm: 100 }));
  assert.equal((await firstSelection).status, "stale");
  assert.equal(bridge.state.trackId, "second");
  const frame = bridge.sample({ trackId: "second", currentTime: 1, frameId: 1 });
  assert.equal(frame.serial, bridge.state.serial);
  assert.equal(frame.serial, 2);
});

test("two ownership changes and disposal invalidate every superseded response", async () => {
  const pending = [deferred(), deferred(), deferred()];
  let request = 0;
  const bridge = createAnalysisBridge({ fetchImpl: () => pending[request++].promise });
  const first = bridge.select({ id: "first", analysisUrl: "./first.json" });
  const second = bridge.select({ id: "second", analysisUrl: "./second.json" });
  const third = bridge.select({ id: "third", analysisUrl: "./third.json" });
  pending[2].resolve(response({ ...offline, trackId: "third" }));
  assert.equal((await third).status, "ready");
  pending[0].resolve(response({ ...offline, trackId: "first" }));
  pending[1].resolve(response({ ...offline, trackId: "second" }));
  assert.equal((await first).status, "stale");
  assert.equal((await second).status, "stale");
  assert.equal(bridge.state.trackId, "third");
  bridge.dispose();
  assert.equal(bridge.state.status, "disposed");
  assert.equal(bridge.state.serial, 4);
});

test("local imports and failed analysis use a world-free realtime contract", async () => {
  const bridge = createAnalysisBridge({
    fetchImpl: async () => response(null, false),
  });
  await bridge.select({ id: "broken-built-in", bpm: 90, analysisUrl: "./broken.json" });
  assert.equal(bridge.state.status, "fallback");
  await bridge.select({ id: "local-1", local: true, bpm: 128 });

  const signal = bridge.sample({
    trackId: "local-1",
    currentTime: 3,
    playing: true,
    realtime: {
      low: -1,
      mid: 0.4,
      high: 4,
      peak: 0.6,
      onset: Number.NaN,
      spectralCentroid: 0.3,
    },
  });
  assert.equal(signal.source, "realtime");
  assert.equal(Object.hasOwn(signal, "worldId"), false);
  assert.equal(signal.section, "realtime");
  assert.equal(signal.low, 0);
  assert.equal(signal.mid, 0.4);
  assert.equal(signal.high, 1);
  assert.equal(signal.onset, 0);
  assert.equal(signal.cameraEvent, null);
  assert.equal(signal.particleEvent, null);
});

test("the bridge normalizes at most once for the same animation frame", async () => {
  let calls = 0;
  const bridge = createAnalysisBridge({
    fetchImpl: async () => response(offline),
    signalFactory(options) {
      calls += 1;
      return {
        time: options.time,
        energy: 0,
        low: 0,
        mid: 0,
        high: 0,
        peak: 0,
        onset: 0,
        spectralCentroid: 0,
        beatPhase: 0,
        barPhase: 0,
        section: "intro",
        cameraEvent: null,
        particleEvent: null,
      };
    },
  });
  await bridge.select({ id: "built-in", analysisUrl: "./built-in.json" });
  const first = bridge.sample({ trackId: "built-in", currentTime: 1, frameId: 99 });
  const second = bridge.sample({ trackId: "built-in", currentTime: 1, frameId: 99 });
  assert.equal(first, second);
  assert.equal(calls, 1);
});

test("paused sampling suppresses rhythmic hits while preserving deterministic signal state", async () => {
  const bridge = createAnalysisBridge({
    fetchImpl: async () => response(offline),
  });
  await bridge.select({ id: "built-in", analysisUrl: "./built-in.json" });
  const first = bridge.sample({
    trackId: "built-in",
    currentTime: 2,
    playing: false,
    frameId: 1,
    realtime: { onset: 1, peak: 1 },
  });
  const second = bridge.sample({
    trackId: "built-in",
    currentTime: 2,
    playing: false,
    frameId: 2,
    realtime: { onset: 1, peak: 1 },
  });
  assert.equal(first.onset, 0);
  assert.equal(first.cameraEvent, null);
  assert.equal(first.particleEvent, null);
  assert.deepEqual(first, second);
});

test("event identities fire once during playback and can fire again after an explicit seek", async () => {
  const bridge = createAnalysisBridge({
    fetchImpl: async () => response(offline),
  });
  await bridge.select({ id: "built-in", analysisUrl: "./built-in.json" });
  const exact = bridge.sample({ trackId: "built-in", currentTime: 2, playing: true, frameId: 1 });
  const nextFrame = bridge.sample({ trackId: "built-in", currentTime: 2.02, playing: true, frameId: 2 });
  assert.equal(exact.cameraEvent.type, "bounded-push");
  assert.equal(nextFrame.cameraEvent, null);
  assert.equal(nextFrame.particleEvent, null);
  bridge.seek(2);
  const afterSeek = bridge.sample({ trackId: "built-in", currentTime: 2, playing: true, frameId: 3 });
  assert.equal(afterSeek.cameraEvent.type, "bounded-push");
  assert.equal(afterSeek.particleEvent.type, "section");
});
