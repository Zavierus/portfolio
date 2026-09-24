import test from "node:test";
import assert from "node:assert/strict";
import {
  RELOAD_DURATION,
  crossedReloadCue,
  sampleReloadTimeline,
} from "../src/game/reload-timeline.js";

test("reload timeline exposes all readable animation phases", () => {
  const phases = [0.05, 0.2, 0.5, 0.72, 0.9, 1].map((progress) => (
    sampleReloadTimeline(progress * RELOAD_DURATION).phase
  ));

  assert.deepEqual(phases, ["tilt", "eject", "insert", "rack", "settle", "complete"]);
});

test("reload timeline keeps magazines and support hand in coherent windows", () => {
  const ejected = sampleReloadTimeline(RELOAD_DURATION * 0.34);
  const inserted = sampleReloadTimeline(RELOAD_DURATION * 0.58);
  const complete = sampleReloadTimeline(RELOAD_DURATION);

  assert.equal(ejected.oldMagazineVisible, true);
  assert.equal(ejected.newMagazineVisible, true);
  assert.ok(ejected.magazineOut > 0.9);
  assert.equal(inserted.oldMagazineVisible, false);
  assert.equal(inserted.newMagazineVisible, true);
  assert.ok(inserted.magazineIn > 0.5);
  assert.equal(complete.supportHandVisible, false);
  assert.equal(complete.slideOffset, 0);
  assert.equal(complete.weaponTilt, 0);
});

test("reload cues only fire when their threshold is crossed", () => {
  assert.equal(crossedReloadCue(0.1, 0.4, 0.2), true);
  assert.equal(crossedReloadCue(0.4, 0.5, 0.2), false);
  assert.equal(crossedReloadCue(0.1, 0.2, 0.9), false);
});
