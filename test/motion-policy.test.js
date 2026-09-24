import assert from "node:assert/strict";
import test from "node:test";

import { evaluateMotionPolicy } from "../src/portfolio/motion-policy.js";

const capableDesktop = {
  reducedMotion: false,
  saveData: false,
  deviceMemory: 8,
  hardwareConcurrency: 8,
  desktop: true,
};

test("capable desktops enable only the hero and project-media effects", () => {
  assert.deepEqual(evaluateMotionPolicy(capableDesktop), {
    enabled: true,
    reason: null,
    effects: {
      hero: true,
      realtimeHero: true,
      projectMedia: true,
    },
  });
});

for (const [name, override, reason] of [
  ["reduced motion", { reducedMotion: true }, "reduced-motion"],
  ["data saving", { saveData: true }, "save-data"],
  ["less than 4GB of device memory", { deviceMemory: 3 }, "low-memory"],
  ["fewer than four logical processors", { hardwareConcurrency: 2 }, "low-concurrency"],
]) {
  test(`${name} disables enhanced motion`, () => {
    assert.deepEqual(evaluateMotionPolicy({ ...capableDesktop, ...override }), {
      enabled: false,
      reason,
      effects: {
        hero: false,
        realtimeHero: false,
        projectMedia: false,
      },
    });
  });
}

test("compact viewports keep project images static", () => {
  assert.deepEqual(evaluateMotionPolicy({ ...capableDesktop, desktop: false }), {
    enabled: false,
    reason: "compact-viewport",
    effects: {
      hero: false,
      realtimeHero: false,
      projectMedia: false,
    },
  });
});

test("missing optional hardware signals do not penalize otherwise capable browsers", () => {
  const policy = evaluateMotionPolicy({
    ...capableDesktop,
    deviceMemory: undefined,
    hardwareConcurrency: undefined,
  });

  assert.equal(policy.enabled, true);
});
