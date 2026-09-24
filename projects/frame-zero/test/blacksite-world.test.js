import test from "node:test";
import assert from "node:assert/strict";
import { getLightningPulse } from "../src/world/blacksite-world.js";

test("hero lightning uses a short double pulse instead of constant flicker", () => {
  assert.equal(getLightningPulse(0.6), 0);
  assert.equal(getLightningPulse(0.68), 1);
  assert.equal(getLightningPulse(0.8), 0);
  assert.equal(getLightningPulse(0.92), 0.58);
  assert.equal(getLightningPulse(1.2), 0);
  assert.equal(getLightningPulse(7.48), 1);
});
