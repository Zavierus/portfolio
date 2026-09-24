import assert from "node:assert/strict";
import test from "node:test";

import {
  PARTICLE_TIERS,
  detectPerformanceEnvironment,
  resolvePerformanceQuality,
} from "../src/performance/quality-policy.js";

const desktop = Object.freeze({
  devicePixelRatio: 2,
  isCoarse: false,
  saveData: false,
  deviceMemory: 16,
  hardwareConcurrency: 12,
  reducedMotion: false,
});

test("capable desktops receive the authored high-fidelity preset", () => {
  const quality = resolvePerformanceQuality(desktop);
  assert.equal(quality.id, "high");
  assert.equal(quality.lod, "high");
  assert.equal(quality.pixelRatio, 1.6);
  assert.equal(quality.pixelRatioCap, 1.6);
  assert.equal(quality.shadows, true);
  assert.equal(quality.bloom, true);
  assert.equal(quality.depthOfField, false);
  assert.equal(quality.cameraTravel, true);
  assert.equal(quality.impactShake, true);
  assert.deepEqual(quality.space, PARTICLE_TIERS.high);
  assert.equal(quality.particleBudget, 26176);
  assert.ok(Object.isFrozen(quality));
});

test("coarse pointers, save-data, low memory, and low core counts select the mobile tier", () => {
  for (const override of [
    { isCoarse: true },
    { saveData: true },
    { deviceMemory: 4 },
    { hardwareConcurrency: 4 },
  ]) {
    const quality = resolvePerformanceQuality({ ...desktop, ...override });
    assert.equal(quality.id, "mobile");
    assert.equal(quality.lod, "low");
    assert.equal(quality.pixelRatio, 1);
    assert.equal(quality.shadows, false);
    assert.equal(quality.depthOfField, false);
    assert.deepEqual(quality.space, PARTICLE_TIERS.mobile);
    assert.equal(quality.particleBudget, 8536);
  }
});

test("mid-range hardware selects the exact balanced particle tier", () => {
  const quality = resolvePerformanceQuality({
    ...desktop,
    deviceMemory: 8,
    hardwareConcurrency: 6,
  });
  assert.equal(quality.id, "balanced");
  assert.equal(quality.lod, "balanced");
  assert.deepEqual(quality.space, PARTICLE_TIERS.balanced);
  assert.equal(quality.particleBudget, 16440);
});

test("pixel ratios are finite and remain inside the preset cap", () => {
  for (const devicePixelRatio of [Number.NaN, Number.POSITIVE_INFINITY, -2, 0, 0.75, 3]) {
    const quality = resolvePerformanceQuality({ ...desktop, devicePixelRatio });
    assert.ok(Number.isFinite(quality.pixelRatio));
    assert.ok(quality.pixelRatio > 0);
    assert.ok(quality.pixelRatio <= quality.pixelRatioCap);
  }
});

test("reduced motion keeps the hero alive but locks travel and impact shake", () => {
  const quality = resolvePerformanceQuality({ ...desktop, reducedMotion: true });
  assert.equal(quality.id, "high");
  assert.equal(quality.cameraTravel, false);
  assert.equal(quality.impactShake, false);
  assert.equal(quality.idleMotion, true);
});

test("compact mobile viewports are detected even when pointer media is unavailable", () => {
  const environment = detectPerformanceEnvironment({
    windowRef: {
      devicePixelRatio: 3,
      innerWidth: 390,
      matchMedia: () => ({ matches: false }),
    },
    navigatorRef: {
      connection: { saveData: false },
      deviceMemory: 8,
      hardwareConcurrency: 8,
    },
  });
  assert.equal(environment.isCoarse, true);
  assert.equal(resolvePerformanceQuality(environment).id, "mobile");
});
