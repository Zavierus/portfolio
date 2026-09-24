import assert from "node:assert/strict";
import test from "node:test";

import {
  computeNullCathedralCameraFrame,
  computeNullCathedralState,
} from "../src/performance/worlds/null-cathedral.js";

test("NULL CATHEDRAL reveals scale by section and crosses the off-center void at peak", () => {
  const intro = computeNullCathedralState({ time: 8, section: "intro-1" });
  const body = computeNullCathedralState({ time: 42, section: "body-2", mid: 0.5 });
  const peak = computeNullCathedralState({ time: 76, section: "peak-3", high: 0.8 });
  const beyond = computeNullCathedralState({ time: 190, section: "break-7" });
  const release = computeNullCathedralState({ time: 112, section: "release-4" });

  assert.ok(body.scaleReveal > intro.scaleReveal + 0.25);
  assert.ok(peak.scaleReveal > body.scaleReveal + 0.2);
  assert.ok(peak.voidCross > intro.voidCross + 0.6);
  assert.ok(beyond.scaleReveal >= peak.scaleReveal);
  assert.ok(release.scaleReveal >= peak.scaleReveal);
});

test("NULL CATHEDRAL motion is slow, finite, deterministic, and camera-lockable", () => {
  const signal = {
    time: 58.25,
    low: 0.7,
    mid: 0.4,
    high: 0.6,
    onset: 1,
    section: "body-2",
    barPhase: 0.32,
  };
  const first = computeNullCathedralState(signal);
  const second = computeNullCathedralState(signal);
  const reduced = computeNullCathedralState(signal, { reducedMotion: true });

  assert.deepEqual(first, second);
  assert.equal(reduced.cameraTravel, 0);
  assert.equal(reduced.cameraPhase, 0);
  assert.ok(Math.abs(first.rootYaw) <= 0.04);
  assert.ok(Math.abs(first.rootPitch) <= 0.025);
  for (const value of Object.values(first)) assert.ok(Number.isFinite(value));
});

test("NULL CATHEDRAL keeps the complete opening silhouette in desktop and portrait frames", () => {
  const intro = computeNullCathedralState({ time: 0, section: "intro-1" });
  const desktop = computeNullCathedralCameraFrame(intro, { aspect: 16 / 10 });
  const portrait = computeNullCathedralCameraFrame(intro, { aspect: 390 / 844 });

  assert.ok(desktop.distance >= 14.5);
  assert.ok(portrait.distance >= 25);
  assert.ok(desktop.fov >= 34);
  assert.ok(portrait.fov >= 45);
  for (const frame of [desktop, portrait]) {
    for (const value of Object.values(frame)) assert.ok(Number.isFinite(value));
  }
});
