import assert from "node:assert/strict";
import test from "node:test";

import { createPerformancePolicy } from "../src/render/performance-policy.js";

test("balanced desktop policy caps render cost without disabling geometry checks", () => {
  const policy = createPerformancePolicy({
    quality: "balanced",
    devicePixelRatio: 2.5,
    hardwareConcurrency: 8,
    reducedMotion: false,
    assetCount: 24,
  });

  assert.equal(policy.pixelRatio, 1.5);
  assert.equal(policy.shadows, true);
  assert.equal(policy.shadowMapSize, 1024);
  assert.equal(policy.monitorFps, 30);
  assert.equal(policy.geometryDetection, true);
  assert.equal(policy.assetCountWarning, false);
  assert.deepEqual(policy.geometry, { radialSegments: 14, castShadows: true, visibleLightCones: "selected" });
});

test("constrained and reduced-motion policy lowers decorative work only", () => {
  const policy = createPerformancePolicy({
    quality: "balanced",
    devicePixelRatio: 2,
    hardwareConcurrency: 2,
    reducedMotion: true,
    assetCount: 90,
  });

  assert.equal(policy.pixelRatio, 1);
  assert.equal(policy.shadows, false);
  assert.equal(policy.monitorFps, 15);
  assert.equal(policy.cameraTransitions, false);
  assert.equal(policy.geometryDetection, true);
  assert.equal(policy.assetCountWarning, true);
  assert.deepEqual(policy.geometry, { radialSegments: 8, castShadows: false, visibleLightCones: "selected" });
});

test("quality presets stay within explicit pixel and shadow budgets", () => {
  const low = createPerformancePolicy({ quality: "low", devicePixelRatio: 3, hardwareConcurrency: 12 });
  const high = createPerformancePolicy({ quality: "high", devicePixelRatio: 3, hardwareConcurrency: 12 });

  assert.equal(low.pixelRatio, 1);
  assert.equal(low.shadows, false);
  assert.equal(high.pixelRatio, 2);
  assert.equal(high.shadowMapSize, 2048);
  assert.equal(high.geometry.radialSegments, 20);
  assert.equal(high.geometry.visibleLightCones, "all");
});
