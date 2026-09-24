import assert from "node:assert/strict";
import test from "node:test";

import { sampleHeroCamera } from "../src/portfolio/hero/hero-camera-program.js";
import { FRACTURE_SLABS } from "../src/portfolio/hero/monumental-fracture.js";

test("hero camera forms a seamless 22-second low-angle loop", () => {
  const opening = sampleHeroCamera(0);
  const closing = sampleHeroCamera(22);
  assert.deepEqual(closing.position, opening.position);
  assert.deepEqual(closing.target, opening.target);
  assert.equal(closing.focalLength, opening.focalLength);
});

test("scroll exit advances through the fracture without changing the shot", () => {
  const resting = sampleHeroCamera(6, { scrollProgress: 0 });
  const exiting = sampleHeroCamera(6, { scrollProgress: 1 });
  assert.ok(exiting.position[2] < resting.position[2]);
  assert.equal(exiting.shotId, resting.shotId);
});

test("pointer parallax remains subordinate to the camera program", () => {
  const left = sampleHeroCamera(8, { pointer: [-1, -1] });
  const right = sampleHeroCamera(8, { pointer: [1, 1] });
  assert.ok(Math.abs(right.position[0] - left.position[0]) <= 0.32);
  assert.ok(Math.abs(right.position[1] - left.position[1]) <= 0.2);
});

test("the monument uses few irregular slabs and one dominant signal", () => {
  assert.ok(FRACTURE_SLABS.length >= 3 && FRACTURE_SLABS.length <= 4);
  assert.ok(FRACTURE_SLABS.every(({ scale }) => new Set(scale).size > 1));
  assert.equal(FRACTURE_SLABS.filter(({ signal }) => signal === "acid").length, 1);
});
