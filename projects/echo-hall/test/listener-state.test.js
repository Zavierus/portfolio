import assert from "node:assert/strict";
import test from "node:test";

import { sampleListenerState } from "../src/listener/listener-state.js";

test("artifact listens by changing tension and balance rather than running", () => {
  const greeting = sampleListenerState(6);
  const wake = sampleListenerState(36);
  const reconstruction = sampleListenerState(90);
  assert.ok(wake.membraneTension > greeting.membraneTension);
  assert.ok(wake.balanceOffset > greeting.balanceOffset);
  assert.ok(reconstruction.coreExposure > wake.coreExposure);
  assert.ok(Math.abs(reconstruction.rotationY) < Math.PI / 3);
});

test("reconstruction opens the archive only in the final chapter", () => {
  assert.equal(sampleListenerState(79.99).archiveOpen, 0);
  assert.ok(sampleListenerState(90).archiveOpen > 0.5);
  assert.equal(sampleListenerState(95).archiveOpen, 1);
});
