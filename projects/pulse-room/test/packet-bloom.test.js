import assert from "node:assert/strict";
import test from "node:test";

import {
  computePacketBloomCameraFrame,
  computePacketBloomState,
  createPacketBloomShardMatrices,
} from "../src/performance/worlds/packet-bloom.js";

test("PACKET BLOOM maps signal bands to independent lattice, fibre, cluster, and trail controls", () => {
  const idle = computePacketBloomState({ time: 18, section: "intro-1" });
  const low = computePacketBloomState({ time: 18, section: "intro-1", low: 1 });
  const mid = computePacketBloomState({ time: 18, section: "body-2", mid: 1 });
  const onset = computePacketBloomState({ time: 18, section: "peak-3", onset: 1 });
  const high = computePacketBloomState({ time: 18, section: "body-2", high: 1 });

  assert.ok(low.latticeBend > idle.latticeBend + 0.6);
  assert.ok(mid.fibreBraid > idle.fibreBraid + 0.55);
  assert.ok(onset.clusterBreak > idle.clusterBreak + 0.7);
  assert.ok(high.trailIntensity > idle.trailIntensity + 0.65);
  assert.ok(onset.cameraImpulse >= 0 && onset.cameraImpulse <= 0.16);
});

test("PACKET BLOOM shard matrices are deterministic, finite, and respond to cluster break", () => {
  const idle = computePacketBloomState({ time: 24, section: "body-2", barPhase: 0.2 });
  const broken = computePacketBloomState({ time: 24, section: "peak-3", onset: 1, barPhase: 0.2 });
  const first = createPacketBloomShardMatrices(48, idle);
  const second = createPacketBloomShardMatrices(48, idle);
  const displaced = createPacketBloomShardMatrices(48, broken);

  assert.deepEqual(first, second);
  assert.equal(first.length, 48 * 16);
  assert.ok(first.every(Number.isFinite));
  assert.notDeepEqual(displaced, first);
});

test("PACKET BLOOM camera motion stays bounded and hard cuts only depend on sections", () => {
  const signal = { time: 42.5, section: "body-2", low: 0.8, onset: 1 };
  const state = computePacketBloomState(signal);
  const repeated = computePacketBloomState(signal);
  const desktop = computePacketBloomCameraFrame(state, { aspect: 16 / 9, time: signal.time });
  const mobile = computePacketBloomCameraFrame(state, { aspect: 390 / 844, time: signal.time });

  assert.deepEqual(state, repeated);
  assert.equal(state.shotIndex, computePacketBloomState({ ...signal, time: 99 }).shotIndex);
  assert.notEqual(state.shotIndex, computePacketBloomState({ ...signal, section: "peak-3" }).shotIndex);
  assert.ok(Math.abs(desktop.x) <= 2.4 && Math.abs(desktop.y) <= 1.5);
  assert.ok(desktop.distance >= 13 && desktop.distance <= 15);
  assert.ok(mobile.distance >= 20);
  for (const frame of [desktop, mobile]) {
    for (const value of Object.values(frame)) assert.ok(Number.isFinite(value));
  }
});
