import assert from "node:assert/strict";
import test from "node:test";

import {
  LOOK_LEVELS,
  createLookController,
  resolveLookSensitivity,
} from "../src/input/look-controller.js";

test("medium look sensitivity uses the approved slower default", () => {
  assert.equal(resolveLookSensitivity("medium"), 0.0008);
  assert.deepEqual(Object.keys(LOOK_LEVELS), ["low", "medium", "high"]);
  assert.throws(() => resolveLookSensitivity("extreme"), /Unknown look sensitivity/);
});

test("look controller ignores the pointer-lock warmup window", () => {
  const look = createLookController({ level: "medium", warmupMs: 150 });
  look.lock(1_000);

  assert.deepEqual(
    look.ingest({ movementX: 800, movementY: -900, now: 1_100 }),
    { yaw: 0, pitch: 0 },
  );
  assert.deepEqual(look.update(1 / 60), { yaw: 0, pitch: 0 });
});

test("look controller caps a large sample and smooths it over frames", () => {
  const look = createLookController({ level: "medium", warmupMs: 0, maxSample: 180 });
  look.lock(0);
  look.ingest({ movementX: 100_000, movementY: -100_000, now: 1 });

  const first = look.update(1 / 60);
  const second = look.update(1 / 60);
  assert.ok(Math.abs(first.yaw) > 0);
  assert.ok(Math.abs(first.yaw) < 0.1);
  assert.ok(Math.abs(second.yaw) > Math.abs(first.yaw));
  assert.ok(Math.abs(second.yaw) < 0.15);
});

test("look controller clamps pitch and ignores input while unlocked", () => {
  const look = createLookController({ level: "high", warmupMs: 0, pitchLimit: 1.08 });
  look.lock(0);
  for (let index = 0; index < 80; index += 1) {
    look.ingest({ movementX: 0, movementY: -180, now: index + 1 });
    look.update(1 / 30);
  }
  assert.equal(look.state().pitch, 1.08);

  look.unlock();
  const before = look.state();
  look.ingest({ movementX: 90, movementY: 90, now: 10_000 });
  look.update(1 / 60);
  assert.deepEqual(look.state(), before);
});

test("look controller can restore checkpoint orientation and change level", () => {
  const look = createLookController({ level: "medium" });
  look.reset({ yaw: 1.2, pitch: -0.4 });
  assert.deepEqual(look.state(), { yaw: 1.2, pitch: -0.4, level: "medium", locked: false });
  look.setLevel("low");
  assert.equal(look.state().level, "low");
});
