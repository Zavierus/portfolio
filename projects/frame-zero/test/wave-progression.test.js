import test from "node:test";
import assert from "node:assert/strict";
import { WAVE_LAYOUT, WAVE_POWER_STATES } from "../src/core.js";
import { DEATH_FRAGMENT_INDICES, MAX_COMBAT_FRAGMENTS } from "../src/game/combat-effects.js";

test("each combat phase preserves power restored by the previous phase", () => {
  for (let index = 1; index < WAVE_POWER_STATES.length; index += 1) {
    const current = new Set(WAVE_POWER_STATES[index]);
    for (const circuit of WAVE_POWER_STATES[index - 1]) assert.equal(current.has(circuit), true);
  }
  assert.equal(WAVE_POWER_STATES.at(-1).includes("extraction"), true);
});

test("final wave spawns outside the extraction container collision volumes", () => {
  const containers = [
    { minX: -12.9, maxX: -7.1, minZ: -108.75, maxZ: -97.25 },
    { minX: 5.6, maxX: 11.4, minZ: -109.75, maxZ: -98.25 },
  ];
  for (const [x, z] of WAVE_LAYOUT.at(-1)) {
    assert.equal(containers.some((box) => x >= box.minX && x <= box.maxX && z >= box.minZ && z <= box.maxZ), false);
  }
});

test("death effects keep the active physics fragment budget bounded", () => {
  assert.deepEqual(DEATH_FRAGMENT_INDICES, [0, 1, 2, 8]);
  assert.equal(MAX_COMBAT_FRAGMENTS, 24);
});
