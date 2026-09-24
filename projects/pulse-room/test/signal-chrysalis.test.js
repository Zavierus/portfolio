import assert from "node:assert/strict";
import test from "node:test";

import { computeSignalChrysalisState } from "../src/performance/worlds/signal-chrysalis.js";

test("SIGNAL CHRYSALIS assigns low, mid, high, and onset to distinct authored controls", () => {
  const idle = computeSignalChrysalisState({ time: 12, section: "intro-1" });
  const low = computeSignalChrysalisState({ time: 12, section: "intro-1", low: 1 });
  const mid = computeSignalChrysalisState({ time: 12, section: "intro-1", mid: 1 });
  const high = computeSignalChrysalisState({ time: 12, section: "intro-1", high: 1 });
  const onset = computeSignalChrysalisState({ time: 12, section: "intro-1", onset: 1 });

  assert.ok(low.shellCompress > idle.shellCompress + 0.5);
  assert.ok(mid.plateSplit > idle.plateSplit + 0.4);
  assert.ok(high.nerveSweep > idle.nerveSweep + 0.5);
  assert.ok(onset.plateSplit > idle.plateSplit + 0.65);
  assert.ok(onset.cameraImpulse > idle.cameraImpulse + 0.05);
});

test("world state is bounded, finite, and deterministic for section seeking", () => {
  const signal = {
    time: 48.25,
    low: 2,
    mid: -1,
    high: Number.NaN,
    onset: 4,
    spectralCentroid: 0.72,
    barPhase: 0.38,
    section: "peak-2",
  };
  const first = computeSignalChrysalisState(signal);
  const second = computeSignalChrysalisState(signal);
  assert.deepEqual(first, second);
  for (const value of Object.values(first)) {
    assert.ok(Number.isFinite(value));
    assert.ok(value >= -1 && value <= 1);
  }
  assert.notEqual(
    computeSignalChrysalisState({ ...signal, section: "body-3" }).sectionOffset,
    first.sectionOffset,
  );
});
