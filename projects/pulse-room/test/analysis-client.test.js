import assert from "node:assert/strict";
import test from "node:test";

import { AnalysisClient } from "../src/analysis/analysis-client.js";

class FakeWorker {
  constructor() {
    this.listeners = new Map();
    this.messages = [];
    this.terminated = false;
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  postMessage(message, transfer) {
    this.messages.push({ message, transfer });
  }

  emit(data) {
    this.listeners.get("message")?.({ data });
  }

  terminate() {
    this.terminated = true;
  }
}

test("AnalysisClient loads and samples a built-in precomputed track", async () => {
  const analysis = {
    bpm: 120,
    beatOffset: 0,
    sections: [{ id: "drop", start: 0, end: 10 }],
    frames: [{ time: 0, energy: 0.8, low: 0.7, mid: 0.6, high: 0.5, onset: 0.4, spectralCentroid: 0.3 }],
  };
  const client = new AnalysisClient({
    fetchImpl: async () => ({ ok: true, json: async () => analysis }),
  });
  const result = await client.loadTrack({ id: "acid", analysisUrl: "./acid.json", bpm: 120 });
  assert.equal(result.status, "ready");
  assert.equal(client.state.status, "ready");
  assert.equal(client.sample({ trackId: "acid", time: 0 }).section, "drop");
});

test("AnalysisClient falls back to realtime data on precomputed failure", async () => {
  const client = new AnalysisClient({ fetchImpl: async () => ({ ok: false, status: 404 }) });
  const result = await client.loadTrack({ id: "missing", analysisUrl: "./missing.json", bpm: 90 });
  assert.equal(result.status, "fallback");
  assert.equal(client.state.error.code, "PRECOMPUTED_LOAD_FAILED");
  const signal = client.sample({ trackId: "missing", time: 2, realtime: { energy: 0.6 } });
  assert.equal(signal.section, "realtime");
  assert.equal(signal.energy, 0.6);
});

test("AnalysisClient reports worker progress and resolves imported PCM", async () => {
  const worker = new FakeWorker();
  const progress = [];
  const client = new AnalysisClient({ workerFactory: () => worker, onProgress: (event) => progress.push(event) });
  const pcm = new Float32Array([0, 0.25, -0.25, 0]);
  const pending = client.analyzePcm({ trackId: "local", pcm, sampleRate: 48000 });
  const requestId = worker.messages[0].message.requestId;
  worker.emit({ type: "progress", requestId, progress: 0.5 });
  worker.emit({
    type: "result",
    requestId,
    analysis: { bpm: 120, beatOffset: 0, sections: [], frames: [] },
  });
  const result = await pending;

  assert.equal(result.status, "ready");
  assert.equal(progress.at(-1).progress, 0.5);
  assert.equal(worker.messages[0].transfer[0], pcm.buffer);
  client.dispose();
  assert.equal(worker.terminated, true);
});

test("AnalysisClient rejects invalid PCM without starting a worker", async () => {
  let workerCreated = false;
  const client = new AnalysisClient({ workerFactory: () => { workerCreated = true; return new FakeWorker(); } });
  await assert.rejects(() => client.analyzePcm({ trackId: "bad", pcm: [], sampleRate: 0 }), /Float32Array/);
  assert.equal(workerCreated, false);
});
