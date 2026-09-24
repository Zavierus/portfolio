import assert from "node:assert/strict";
import test from "node:test";

import { createExampleProject } from "../src/domain/example-project.js";
import {
  createEquipmentRows,
  createExecutionPackage,
  equipmentRowsToCsv,
  parseProjectFile,
  serializeProject,
} from "../src/export/export-project.js";

test("project JSON export is stable and can be parsed without mutation", () => {
  const project = createExampleProject();
  const exported = serializeProject(project);

  assert.equal(exported.ok, true);
  assert.ok(exported.text.endsWith("\n"));
  assert.match(exported.filename, /^set-flow-garment-demo\.setflow\.json$/);

  const parsed = parseProjectFile(exported.text);
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.project, project);
  parsed.project.room.width = 9;
  assert.equal(project.room.width, 3.8);
});

test("invalid JSON and invalid projects return actionable errors", () => {
  const invalidJson = parseProjectFile("{broken");
  assert.equal(invalidJson.ok, false);
  assert.equal(invalidJson.code, "invalid-json");

  const project = createExampleProject();
  project.room.height = -1;
  const invalidProject = serializeProject(project);
  assert.equal(invalidProject.ok, false);
  assert.equal(invalidProject.code, "invalid-project");
  assert.ok(invalidProject.errors.some((error) => error.path === "room.height"));
});

test("equipment export produces spreadsheet-safe rows and CSV", () => {
  const project = createExampleProject();
  project.assets[0].name = "主背景板, A组";
  const rows = createEquipmentRows(project);
  const csv = equipmentRowsToCsv(rows);

  assert.equal(rows.length, project.assets.length);
  assert.deepEqual(rows[0], {
    id: "backdrop-1",
    name: "主背景板, A组",
    type: "backdrop",
    quantity: 1,
    unitCost: 2600,
    subtotal: 2600,
  });
  assert.match(csv, /"主背景板, A组"/);
  assert.match(csv, /^ID,名称,类型,数量,单价,小计\r?\n/);
});

test("execution package contains project, equipment, camera captures and a printable evidence report", () => {
  const project = createExampleProject();
  const issues = [{
    id: "collision:a:b",
    type: "collision",
    severity: "warning",
    assetIds: ["a", "b"],
    cameraId: null,
    evidence: { overlapDepth: 0.18 },
    message: "活动区与灯架重叠 18 cm",
    suggestion: "移动灯架后重新检查",
  }];
  const captures = {
    top: "data:image/png;base64,TOP",
    "camera-primary": "data:image/png;base64,CAMA",
    "camera-detail": "data:image/png;base64,CAMB",
  };
  const result = createExecutionPackage(project, { issues, captures });

  assert.equal(result.ok, true);
  assert.deepEqual(result.files.map((file) => file.role), ["project", "equipment", "report", "top-view", "camera-primary", "camera-detail"]);
  const report = result.files.find((file) => file.role === "report").text;
  assert.match(report, /3\.80 × 5\.60 × 2\.80 m/);
  assert.match(report, /活动区与灯架重叠 18 cm/);
  assert.match(report, /不能替代现场安全检查/);
  assert.match(report, /data:image\/png;base64,CAMA/);
});

test("execution package reports missing captures instead of implying a complete image set", () => {
  const result = createExecutionPackage(createExampleProject(), { captures: { top: "data:image/png;base64,TOP" } });
  assert.deepEqual(result.missingCaptures, ["camera-primary", "camera-detail"]);
  assert.match(result.files.find((file) => file.role === "report").text, /未获取画面/);
});
