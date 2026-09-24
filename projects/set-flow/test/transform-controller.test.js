import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeAngle,
  normalizeTransformForCommit,
  snapValue,
} from "../src/interactions/transform-controller.js";

test("transform values snap to the configured metric grid", () => {
  assert.equal(snapValue(1.24, 0.1), 1.2);
  assert.equal(snapValue(1.26, 0.1), 1.3);
  assert.equal(snapValue(-0.26, 0.1), -0.3);
  assert.equal(snapValue(0.333, 0), 0.333);
});

test("rotation normalization remains within the signed pi range", () => {
  assert.equal(normalizeAngle(Math.PI * 3), -Math.PI);
  assert.equal(normalizeAngle(-Math.PI * 3), -Math.PI);
  assert.ok(Math.abs(normalizeAngle(Math.PI * 2 + 0.25) - 0.25) < 1e-8);
});

test("committed transforms snap position without mutating the preview", () => {
  const preview = {
    position: { x: 1.24, y: 0.391, z: -0.26 },
    rotation: { x: 0, y: Math.PI * 2 + 0.25, z: 0 },
  };
  const committed = normalizeTransformForCommit(preview, { grid: 0.1 });

  assert.deepEqual(committed.position, { x: 1.2, y: 0.4, z: -0.3 });
  assert.ok(Math.abs(committed.rotation.y - 0.25) < 1e-8);
  assert.equal(preview.position.x, 1.24);
});

test("grounded assets keep their half-height floor constraint after snapping", () => {
  const committed = normalizeTransformForCommit({
    position: { x: 0.63, y: 0.95, z: -1.85 },
    rotation: { x: 0, y: 0, z: 0 },
  }, { grid: 0.1, minY: 0.95 });

  assert.equal(committed.position.y, 0.95);
});
