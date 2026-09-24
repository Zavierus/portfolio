import assert from "node:assert/strict";
import test from "node:test";

import { sampleMemoryState } from "../src/memory/memory-state.js";

test("memory resolves from fragments to dead Earth to a reconstructed body", () => {
  assert.equal(sampleMemoryState(45).mode, "dormant");
  assert.equal(sampleMemoryState(54).mode, "fragments");
  assert.equal(sampleMemoryState(72).mode, "dead-earth");
  assert.equal(sampleMemoryState(90).mode, "body");
  assert.ok(sampleMemoryState(94).bodyCompletion > 0.8);
});
