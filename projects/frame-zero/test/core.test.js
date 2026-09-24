import test from "node:test";
import assert from "node:assert/strict";
import {
  WAVE_LAYOUT,
  PROJECTILE_BOUNDS,
  createTaskScheduler,
  circleIntersectsAabb,
  isProjectileOutOfBounds,
  resolvePlayerMovement,
  segmentIntersectsAabb,
} from "../src/core.js";

test("scheduler preserves task time while updates are paused", () => {
  const scheduler = createTaskScheduler();
  let completed = 0;
  scheduler.schedule(0.8, () => { completed += 1; }, "reload");

  scheduler.update(0.4);
  scheduler.update(0);
  scheduler.update(0);
  assert.equal(completed, 0);
  assert.equal(scheduler.remaining("reload"), 0.4);

  scheduler.update(0.39);
  assert.equal(completed, 0);
  scheduler.update(0.02);
  assert.equal(completed, 1);
  assert.equal(scheduler.has("reload"), false);
});

test("scheduler replaces a task with the same key and can be cleared", () => {
  const scheduler = createTaskScheduler();
  let result = "";
  scheduler.schedule(1, () => { result = "old"; }, "wave");
  scheduler.schedule(0.2, () => { result = "new"; }, "wave");
  scheduler.update(0.21);
  assert.equal(result, "new");
  scheduler.schedule(1, () => { result = "late"; }, "late");
  scheduler.clear();
  scheduler.update(2);
  assert.equal(result, "new");
});

test("scheduler clear inside a callback suppresses later tasks in the same update", () => {
  const scheduler = createTaskScheduler();
  const completed = [];
  scheduler.schedule(0.1, () => {
    completed.push("reset");
    scheduler.clear();
  }, "reset");
  scheduler.schedule(0.1, () => completed.push("stale"), "stale");

  scheduler.update(0.2);
  assert.deepEqual(completed, ["reset"]);
});

test("circle detects overlap with an axis-aligned obstacle", () => {
  const obstacle = { minX: -1, maxX: 1, minZ: -2, maxZ: 2 };
  assert.equal(circleIntersectsAabb({ x: 1.3, z: 0 }, 0.4, obstacle), true);
  assert.equal(circleIntersectsAabb({ x: 1.5, z: 0 }, 0.4, obstacle), false);
});

test("player movement slides along an obstacle instead of entering it", () => {
  const obstacle = { minX: -1, maxX: 1, minZ: -1, maxZ: 1 };
  const resolved = resolvePlayerMovement(
    { x: -1.6, z: -0.6 },
    { x: 1, z: 0.5 },
    0.35,
    [obstacle],
  );
  assert.equal(resolved.x, -1.6);
  assert.ok(Math.abs(resolved.z - (-0.1)) < 1e-9);
});

test("bullet segment detects an obstacle even when it crosses in one frame", () => {
  const obstacle = { minX: -0.5, maxX: 0.5, minZ: -0.1, maxZ: 0.1 };
  assert.equal(segmentIntersectsAabb({ x: 0, z: -1 }, { x: 0, z: 1 }, obstacle), true);
  assert.equal(segmentIntersectsAabb({ x: 1, z: -1 }, { x: 1, z: 1 }, obstacle), false);
});

test("campaign contains four waves and ten hostiles", () => {
  assert.equal(WAVE_LAYOUT.length, 4);
  assert.equal(WAVE_LAYOUT.reduce((sum, wave) => sum + wave.length, 0), 10);
  assert.ok(Math.max(...WAVE_LAYOUT[3].map(([, z]) => z)) < -100);
});

test("projectile bounds cover every combat zone", () => {
  const finalWaveZ = Math.min(...WAVE_LAYOUT.flat().map(([, z]) => z));
  assert.ok(PROJECTILE_BOUNDS.minZ < finalWaveZ);
  assert.equal(isProjectileOutOfBounds({ x: 0, z: finalWaveZ }), false);
  assert.equal(isProjectileOutOfBounds({ x: 0, z: PROJECTILE_BOUNDS.minZ - 1 }), true);
});
