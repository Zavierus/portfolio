import assert from "node:assert/strict";
import test from "node:test";

import { createPerformanceDirector } from "../src/performance/performance-director.js";

function createFakePerformance(id, calls) {
  return {
    mount() { calls.push(`${id}:mount`); },
    setEnvelope(value) { calls.push(`${id}:envelope:${value}`); },
    update(frame) { calls.push(`${id}:update:${frame.playing}`); },
    pause() { calls.push(`${id}:pause`); },
    resume() { calls.push(`${id}:resume`); },
    seek(time) { calls.push(`${id}:seek:${time}`); },
    dispose() { calls.push(`${id}:dispose`); },
  };
}

const moduleFor = (id, calls) => ({
  createPerformance: () => createFakePerformance(id, calls),
});

test("director mounts once, updates only active, and disposes after an authored transition", async () => {
  const calls = [];
  const director = createPerformanceDirector({
    stage: { quality: { id: "high" } },
    transitionDuration: 0.8,
    loadPerformance: async (track) => ({
      descriptor: { id: track.id },
      module: moduleFor(track.id, calls),
    }),
  });

  await director.select({ id: "alpha" });
  assert.equal(director.state, "entering");
  director.update({ playing: true, currentTime: 0 }, 0.4);
  assert.equal(director.state, "performing");
  assert.equal(calls.filter((entry) => entry === "alpha:mount").length, 1);

  await director.select({ id: "beta" });
  assert.equal(director.state, "leaving");
  director.update({ playing: true, currentTime: 1 }, 0.4);
  assert.equal(calls.filter((entry) => entry === "alpha:dispose").length, 1);
  assert.equal(calls.filter((entry) => entry === "beta:mount").length, 1);
  assert.equal(director.state, "entering");

  director.update({ playing: true, currentTime: 1.4 }, 0.4);
  assert.equal(director.state, "performing");
  assert.ok(calls.includes("beta:update:true"));
  assert.equal(calls.includes("alpha:update:true"), true);
});

test("rapid selections cancel stale asynchronous loads", async () => {
  const calls = [];
  const pending = new Map();
  const loadPerformance = (track) => new Promise((resolve) => pending.set(track.id, resolve));
  const director = createPerformanceDirector({ stage: {}, loadPerformance });

  const alpha = director.select({ id: "alpha" });
  const beta = director.select({ id: "beta" });
  pending.get("alpha")({ descriptor: { id: "alpha" }, module: moduleFor("alpha", calls) });
  assert.equal(await alpha, false);
  pending.get("beta")({ descriptor: { id: "beta" }, module: moduleFor("beta", calls) });
  assert.equal(await beta, true);
  assert.equal(calls.includes("alpha:mount"), false);
  assert.equal(calls.filter((entry) => entry === "beta:mount").length, 1);
});

test("pause, resume, and deterministic seek are forwarded once", async () => {
  const calls = [];
  const director = createPerformanceDirector({
    stage: {},
    transitionDuration: 0.8,
    loadPerformance: async () => ({ descriptor: { id: "alpha" }, module: moduleFor("alpha", calls) }),
  });
  await director.select({ id: "alpha" });
  director.update({ playing: false, currentTime: 0 }, 0.4);
  director.update({ playing: false, currentTime: 0 }, 0.1);
  director.update({ playing: true, currentTime: 0.1 }, 0.1);
  director.seek(12.5, { section: 2 });

  assert.equal(calls.filter((entry) => entry === "alpha:pause").length, 1);
  assert.equal(calls.filter((entry) => entry === "alpha:resume").length, 1);
  assert.equal(calls.filter((entry) => entry === "alpha:seek:12.5").length, 1);
  assert.equal(director.currentTime, 12.5);
});

test("director disposal is idempotent", async () => {
  const calls = [];
  const director = createPerformanceDirector({
    stage: {},
    loadPerformance: async () => ({ descriptor: { id: "alpha" }, module: moduleFor("alpha", calls) }),
  });
  await director.select({ id: "alpha" });
  assert.equal(director.dispose(), true);
  assert.equal(director.dispose(), false);
  assert.equal(director.state, "disposed");
  assert.equal(calls.filter((entry) => entry === "alpha:dispose").length, 1);
});
