import assert from "node:assert/strict";
import test from "node:test";

import { focalLengthToVerticalFov, normalizeMonitorEmphasis } from "../src/render/camera-monitor.js";

test("camera monitor converts focal length to a narrower field of view", () => {
  const wide = focalLengthToVerticalFov(28);
  const detail = focalLengthToVerticalFov(50);

  assert.ok(wide > detail);
  assert.ok(wide > 40 && wide < 50);
  assert.ok(detail > 20 && detail < 30);
});

test("camera monitor clamps unsupported focal lengths to domain limits", () => {
  assert.equal(focalLengthToVerticalFov(2), focalLengthToVerticalFov(12));
  assert.equal(focalLengthToVerticalFov(500), focalLengthToVerticalFov(200));
});

test("monitor emphasis accepts known safe zones and clears unsupported values", () => {
  assert.deepEqual(normalizeMonitorEmphasis("camera-primary", "platform"), {
    cameraId: "camera-primary",
    safeZone: "platform",
  });
  assert.deepEqual(normalizeMonitorEmphasis(null, "made-up"), { cameraId: null, safeZone: null });
});
