import assert from "node:assert/strict";
import test from "node:test";

import { sampleMegastructureState } from "../src/world/megastructure-state.js";

test("scale is misread before the megastructure wakes", () => {
  assert.equal(sampleMegastructureState(10).classification, "void");
  assert.equal(sampleMegastructureState(20).classification, "surface");
  assert.equal(sampleMegastructureState(36).classification, "awake");
  assert.ok(sampleMegastructureState(38).fold > 0.4);
  assert.ok(sampleMegastructureState(44).membranePulse > 0.5);
});
