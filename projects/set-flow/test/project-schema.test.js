import assert from "node:assert/strict";
import test from "node:test";

import {
  PROJECT_SCHEMA_VERSION,
  cloneProject,
  createEmptyProject,
  validateProject,
} from "../src/domain/project-schema.js";
import { createExampleProject } from "../src/domain/example-project.js";

test("example project is valid and uses metric units", () => {
  const project = createExampleProject();
  const result = validateProject(project);

  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
  assert.equal(project.schemaVersion, PROJECT_SCHEMA_VERSION);
  assert.deepEqual(project.room, {
    width: 3.8,
    depth: 5.6,
    height: 2.8,
    unit: "m",
  });
  assert.equal(project.cameras.length, 2);
  assert.equal(project.brief.category, "garment");
  assert.equal(project.brief.presenterCount, 2);
});

test("validation reports object paths without mutating input", () => {
  const project = createExampleProject();
  project.room.width = -1;
  const beforeValidation = structuredClone(project);

  const result = validateProject(project);

  assert.equal(result.valid, false);
  assert.equal(result.errors[0].path, "room.width");
  assert.equal(result.errors[0].code, "positive-number-required");
  assert.deepEqual(project, beforeValidation);
});

test("validation rejects duplicate asset identifiers and invalid cameras", () => {
  const project = createExampleProject();
  project.assets[1].id = project.assets[0].id;
  project.cameras[0].focalLength = 4;

  const result = validateProject(project);

  assert.ok(result.errors.some((error) => error.code === "duplicate-id"));
  assert.ok(result.errors.some((error) => error.path === "cameras[0].focalLength"));
});

test("camera data keeps a supported aspect, target and safe-zone preset", () => {
  const project = createExampleProject();
  assert.deepEqual(project.cameras.map((camera) => camera.aspect), ["9:16", "9:16"]);
  assert.deepEqual(project.cameras.map((camera) => camera.safeZonePreset), ["vertical-live", "vertical-live"]);

  project.cameras[1].safeZonePreset = "imaginary-overlay";
  const result = validateProject(project);
  assert.ok(result.errors.some((error) => error.path === "cameras[1].safeZonePreset"));
});

test("cloning and overrides never expose shared mutable state", () => {
  const source = createEmptyProject({ name: "Studio test" });
  const clone = cloneProject(source);

  clone.room.width = 9;
  clone.brief.presenterCount = 2;

  assert.equal(source.name, "Studio test");
  assert.notEqual(source.room.width, clone.room.width);
  assert.notEqual(source.brief.presenterCount, clone.brief.presenterCount);
});
