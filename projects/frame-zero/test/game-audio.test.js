import test from "node:test";
import assert from "node:assert/strict";
import { killCueProfile } from "../src/audio/game-audio.js";

test("kill cue climbs with streak without unbounded pitch", () => {
  const first = killCueProfile({ combo: 1 });
  const third = killCueProfile({ combo: 3 });
  const capped = killCueProfile({ combo: 99 });

  assert.ok(third.fundamental > first.fundamental);
  assert.equal(capped.streak, 5);
});

test("headshot cue adds a high-frequency glint", () => {
  assert.equal(killCueProfile({ headshot: false }).glint, 0);
  assert.ok(killCueProfile({ headshot: true }).glint > 1800);
});
