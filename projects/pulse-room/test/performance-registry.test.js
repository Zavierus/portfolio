import assert from "node:assert/strict";
import test from "node:test";

import {
  PERFORMANCE_DESCRIPTORS,
  createPerformanceModuleLoader,
  performanceDescriptorForTrack,
  performanceIdForTrack,
} from "../src/performance/performance-registry.js";

test("each built-in track selects one distinct authored world", () => {
  const ids = [
    performanceIdForTrack({ id: "acid-action" }),
    performanceIdForTrack({ id: "cerberus" }),
    performanceIdForTrack({ id: "beyond-the-stars" }),
    performanceIdForTrack({ id: "i-plus-plus" }),
  ];

  assert.deepEqual(ids, ["signal-chrysalis", "triune-gate", "null-cathedral", "packet-bloom"]);
  assert.equal(new Set(ids).size, 4);
  assert.equal(performanceIdForTrack({ id: "local-file" }), "signal-field");
  assert.equal(performanceIdForTrack(), "signal-field");
});

test("the registry exposes stable authored-world display contracts", () => {
  assert.deepEqual(Object.keys(PERFORMANCE_DESCRIPTORS), [
    "signal-chrysalis",
    "triune-gate",
    "null-cathedral",
    "packet-bloom",
    "signal-field",
  ]);

  const descriptor = performanceDescriptorForTrack({ id: "beyond-the-stars" });
  assert.equal(descriptor.id, "null-cathedral");
  assert.equal(descriptor.label, "NULL CATHEDRAL");
  assert.equal(descriptor.authored, true);
  assert.ok(Object.isFrozen(descriptor));

  const fallback = performanceDescriptorForTrack({ id: "imported-audio" });
  assert.equal(fallback.id, "signal-field");
  assert.equal(fallback.authored, false);
});

test("module loading is lazy and keyed by the selected performance", async () => {
  const calls = [];
  const load = createPerformanceModuleLoader({
    "triune-gate": async () => {
      calls.push("triune-gate");
      return { createPerformance: () => "gate" };
    },
  });

  assert.deepEqual(calls, []);
  const result = await load({ id: "cerberus" });
  assert.deepEqual(calls, ["triune-gate"]);
  assert.equal(result.descriptor.id, "triune-gate");
  assert.equal(result.module.createPerformance(), "gate");
  await assert.rejects(() => load({ id: "acid-action" }), /No performance loader/);
});
