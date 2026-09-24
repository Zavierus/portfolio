import assert from "node:assert/strict";
import test from "node:test";

import { computeTriuneGateState } from "../src/performance/worlds/triune-gate.js";

test("TRIUNE GATE alternates onset strikes across three distinct bodies", () => {
  const left = computeTriuneGateState({ time: 0.1, onset: 1, section: "intro-1" });
  const center = computeTriuneGateState({ time: 0.5, onset: 1, section: "intro-1" });
  const right = computeTriuneGateState({ time: 0.8, onset: 1, section: "intro-1" });
  assert.ok(left.leftStrike > left.centerStrike && left.leftStrike > left.rightStrike);
  assert.ok(center.centerStrike > center.leftStrike && center.centerStrike > center.rightStrike);
  assert.ok(right.rightStrike > right.leftStrike && right.rightStrike > right.centerStrike);
});

test("low tensions cables, sections lock the gate, and camera impulse stays bounded", () => {
  const idle = computeTriuneGateState({ time: 12, section: "intro-1" });
  const tension = computeTriuneGateState({ time: 12, low: 1, section: "intro-1" });
  const locked = computeTriuneGateState({ time: 12, mid: 1, section: "peak-2", onset: 1 });
  assert.ok(tension.cableTension > idle.cableTension + 0.6);
  assert.ok(locked.gateLock > idle.gateLock + 0.45);
  assert.ok(locked.cameraImpulse >= 0 && locked.cameraImpulse <= 0.12);
  assert.deepEqual(locked, computeTriuneGateState({ time: 12, mid: 1, section: "peak-2", onset: 1 }));
  for (const value of Object.values(locked)) assert.ok(Number.isFinite(value));
});
