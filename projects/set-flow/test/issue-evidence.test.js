import assert from "node:assert/strict";
import test from "node:test";

import { createExampleProject } from "../src/domain/example-project.js";
import { evaluateProject } from "../src/detection/issue-model.js";
import { diffIssues } from "../src/detection/issue-diff.js";
import { createIssueEvidenceModel } from "../src/ui/issue-evidence-model.js";
import { createIssueRepairTracker } from "../src/ui/issue-repair-state.js";

test("issue differences separate new persistent and resolved IDs", () => {
  const result = diffIssues(
    [{ id: "a" }, { id: "b" }, { id: "b" }],
    [{ id: "b" }, { id: "c" }],
  );

  assert.deepEqual(result.resolvedIds, ["a"]);
  assert.deepEqual(result.persistentIds, ["b"]);
  assert.deepEqual(result.newIds, ["c"]);
});

test("collision evidence preserves measured overlap and requests geometry helpers", () => {
  const collision = evaluateProject(createExampleProject()).find((issue) => issue.type === "collision");
  const model = createIssueEvidenceModel(collision);

  assert.equal(model.kind, "collision");
  assert.deepEqual(model.assetIds, collision.assetIds);
  assert.equal(model.measurement.value, collision.evidence.overlapDepth);
  assert.equal(model.measurement.unit, "m");
  assert.equal(model.visual.showCollisionBoxes, true);
  assert.equal(model.visual.showLineOfSight, false);
});

test("boundary camera overlay obstruction and budget issues map to truthful evidence", () => {
  const fixtures = [
    { id: "boundary:rack", type: "boundary", assetIds: ["rack"], cameraId: null, evidence: { outsideDistance: 0.24, axes: ["right"] }, message: "越界", suggestion: "移回" },
    { id: "platform-overlay:cam:p", type: "platform-overlay", assetIds: ["p"], cameraId: "cam", evidence: { normalizedX: 0.8, zoneStart: 0.68 }, message: "安全区", suggestion: "调整" },
    { id: "camera-obstruction:cam:rack", type: "camera-obstruction", assetIds: ["rack"], cameraId: "cam", evidence: { lineDistance: 0.1, lineProgress: 0.5 }, message: "遮挡", suggestion: "移动" },
    { id: "budget:equipment", type: "budget", assetIds: ["rack"], cameraId: null, evidence: { total: 22_000, limit: 20_000, overBy: 2_000 }, message: "超预算", suggestion: "替换" },
  ];
  const [boundary, overlay, obstruction, budget] = fixtures.map(createIssueEvidenceModel);

  assert.equal(boundary.visual.showBoundaryMeasure, true);
  assert.deepEqual(boundary.measurement, { label: "越界", value: 0.24, unit: "m" });
  assert.equal(overlay.visual.safeZone, "platform");
  assert.equal(overlay.cameraId, "cam");
  assert.equal(obstruction.visual.showLineOfSight, true);
  assert.equal(budget.visual.showInScene, false);
  assert.deepEqual(budget.measurement, { label: "超出预算", value: 2000, unit: "CNY" });
});

test("unknown issue types remain focusable without inventing measurements", () => {
  const model = createIssueEvidenceModel({ id: "custom:1", type: "custom", assetIds: ["a"], cameraId: null, evidence: {}, message: "自定义", suggestion: "检查" });

  assert.equal(model.kind, "neutral");
  assert.equal(model.measurement, null);
  assert.equal(model.visual.showInScene, true);
});

test("active issue resolves once and persistent evidence keeps its latest measurement", () => {
  const collision = { id: "collision:a:b", type: "collision", assetIds: ["a", "b"], evidence: { overlapDepth: 0.2 }, message: "碰撞", suggestion: "分开" };
  const tracker = createIssueRepairTracker([collision]);
  tracker.focus(collision.id);

  const persistent = tracker.update([{ ...collision, evidence: { overlapDepth: 0.1 } }]);
  assert.equal(persistent.activeIssue.evidence.overlapDepth, 0.1);
  assert.equal(persistent.resolvedMessage, null);

  const resolved = tracker.update([]);
  assert.equal(resolved.activeIssue, null);
  assert.match(resolved.resolvedMessage, /已解决：碰撞/);
  assert.equal(tracker.update([]).resolvedMessage, null);
});
