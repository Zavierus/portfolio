import assert from "node:assert/strict";
import test from "node:test";

import { createExampleProject } from "../src/domain/example-project.js";
import { evaluateProject } from "../src/detection/issue-model.js";
import { detectBoundaryIssues } from "../src/detection/boundary-rules.js";
import { detectCollisionIssues } from "../src/detection/collision-rules.js";
import {
  detectCameraIssues,
  projectPointToCamera,
} from "../src/detection/camera-rules.js";

function assertIssueShape(issue) {
  assert.equal(typeof issue.id, "string");
  assert.equal(typeof issue.type, "string");
  assert.ok(["info", "warning", "critical"].includes(issue.severity));
  assert.ok(Array.isArray(issue.assetIds));
  assert.ok(issue.cameraId === null || typeof issue.cameraId === "string");
  assert.equal(typeof issue.evidence, "object");
  assert.equal(typeof issue.message, "string");
  assert.equal(typeof issue.suggestion, "string");
}

test("boundary rules identify an object outside the room with measured evidence", () => {
  const project = createExampleProject();
  project.assets.find((asset) => asset.id === "rack-1").transform.position.x = 2.4;
  const issues = detectBoundaryIssues(project);

  assert.ok(issues.some((issue) => issue.id === "boundary:rack-1"));
  assert.ok(issues.some((issue) => issue.evidence.outsideDistance > 0));
  issues.forEach(assertIssueShape);
});

test("collision rules report the intentional presenter and light-stand overlap", () => {
  const issues = detectCollisionIssues(createExampleProject());
  const issue = issues.find((entry) => entry.assetIds.includes("presenter-2") && entry.assetIds.includes("light-stand-2"));

  assert.ok(issue);
  assert.equal(issue.type, "collision");
  assert.ok(issue.evidence.overlapDepth > 0);
  assertIssueShape(issue);
});

test("camera projection and coverage rules expose missing and platform-conflict evidence", () => {
  const project = createExampleProject();
  const camera = project.cameras[0];
  const center = projectPointToCamera(camera.target, camera);
  assert.ok(Math.abs(center.x) < 1e-8);
  assert.ok(Math.abs(center.y) < 1e-8);

  project.cameras = [];
  const missing = detectCameraIssues(project);
  assert.ok(missing.some((issue) => issue.type === "camera-coverage"));

  const overlayProject = createExampleProject();
  overlayProject.cameras[0].target = { x: 0, y: 1.0, z: -0.55 };
  overlayProject.assets.find((asset) => asset.id === "presenter-2").transform.position.x = 0.62;
  const overlay = detectCameraIssues(overlayProject);
  assert.ok(overlay.some((issue) => issue.type === "platform-overlay"));
});

test("complete evaluation includes over-budget evidence and stable issue identifiers", () => {
  const project = createExampleProject();
  project.budget.limit = 1000;
  const issues = evaluateProject(project);

  assert.ok(issues.some((issue) => issue.type === "budget"));
  assert.equal(new Set(issues.map((issue) => issue.id)).size, issues.length);
  issues.forEach(assertIssueShape);
});
