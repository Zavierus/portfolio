import test from "node:test";
import assert from "node:assert/strict";
import { createTimeSystem } from "../src/core/time-system.js";

test("time fracture slows the world while keeping player response higher", () => {
  const time = createTimeSystem();

  assert.equal(time.beginFracture(), true);
  const frame = time.update(1);

  assert.equal(frame.realDelta, 1);
  assert.equal(frame.worldDelta, 0.28);
  assert.equal(frame.playerDelta, 0.72);
  assert.equal(time.snapshot().energy, 160);
});

test("two complete fractures fit in the energy reserve", () => {
  const time = createTimeSystem();

  time.beginFracture();
  time.update(2.5);
  assert.equal(time.snapshot().energy, 100);
  assert.equal(time.snapshot().active, false);

  time.beginFracture();
  time.update(2.5);
  assert.equal(time.snapshot().energy, 0);
  assert.equal(time.beginFracture(), false);
});

test("fracture rewards restore their configured energy without exceeding capacity", () => {
  const time = createTimeSystem({ initialEnergy: 0 });

  assert.equal(time.restore("kill"), 25);
  assert.equal(time.restore("headshot"), 35);
  assert.equal(time.restore("evade"), 43);
  assert.equal(time.restore("objective"), 123);
  assert.equal(time.restore("objective"), 200);
});

test("pause freezes fracture duration and energy", () => {
  const time = createTimeSystem();
  time.beginFracture();
  time.update(0.5);
  time.setPaused(true);

  const paused = time.update(8);
  assert.deepEqual(paused, { realDelta: 0, worldDelta: 0, playerDelta: 0 });
  assert.equal(time.snapshot().energy, 180);
  assert.equal(time.snapshot().remaining, 2);
});

test("invalid fracture configuration is rejected", () => {
  assert.throws(() => createTimeSystem({ drainPerSecond: -40 }), /drainPerSecond/);
  assert.throws(() => createTimeSystem({ fractureDuration: Number.NaN }), /fractureDuration/);
  assert.throws(() => createTimeSystem({ worldScale: 1.2 }), /worldScale/);
});
