import assert from "node:assert/strict";
import test from "node:test";

import { createVjSignal } from "../src/analysis/vj-signal.js";

test("precomputed analysis produces bounded beat, section, and spectral signals", () => {
  const analysis = {
    bpm: 120,
    beatOffset: 0.1,
    sections: [
      { id: "intro", start: 0, end: 1 },
      { id: "drive", start: 1, end: 4 },
    ],
    frames: [
      { time: 1, energy: 0.4, low: 0.7, mid: 0.3, high: 0.2, onset: 0.1, spectralCentroid: 0.45 },
      { time: 2, energy: 0.8, low: 0.5, mid: 0.65, high: 0.6, onset: 0.9, spectralCentroid: 0.75 },
    ],
  };

  const signal = createVjSignal({ time: 1.1, analysis, realtime: { energy: 0.2, low: 0.2, mid: 0.2, high: 0.2 } });
  assert.equal(signal.time, 1.1);
  assert.equal(signal.section, "drive");
  assert.ok(signal.beatPhase >= 0 && signal.beatPhase < 1);
  assert.ok(signal.barPhase >= 0 && signal.barPhase < 1);
  for (const field of ["energy", "low", "mid", "high", "onset", "spectralCentroid"]) {
    assert.ok(Number.isFinite(signal[field]));
    assert.ok(signal[field] >= 0 && signal[field] <= 1);
  }
});

test("missing analysis falls back to realtime bands without NaN", () => {
  const signal = createVjSignal({
    time: Number.NaN,
    fallbackBpm: 128,
    realtime: {
      energy: Number.POSITIVE_INFINITY,
      low: -2,
      mid: 0.48,
      high: 4,
      onset: Number.NaN,
      spectralCentroid: undefined,
    },
  });

  assert.deepEqual(signal, {
    time: 0,
    beatPhase: 0,
    barPhase: 0,
    section: "realtime",
    energy: 0,
    low: 0,
    mid: 0.48,
    high: 1,
    onset: 0,
    spectralCentroid: 0,
  });
});

test("analysis frame interpolation is deterministic at boundaries", () => {
  const analysis = {
    bpm: 100,
    beatOffset: 0,
    sections: [{ id: "body", start: 0, end: 10 }],
    frames: [
      { time: 0, energy: 0, low: 0, mid: 0, high: 0, onset: 0, spectralCentroid: 0 },
      { time: 2, energy: 1, low: 1, mid: 1, high: 1, onset: 1, spectralCentroid: 1 },
    ],
  };
  const first = createVjSignal({ time: 1, analysis });
  const second = createVjSignal({ time: 1, analysis });
  assert.deepEqual(first, second);
  assert.equal(first.energy, 0.5);
  assert.equal(first.spectralCentroid, 0.5);
});
