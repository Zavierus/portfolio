import assert from "node:assert/strict";
import test from "node:test";

import { createExampleProject } from "../src/domain/example-project.js";
import { createSaveCoordinator } from "../src/persistence/save-coordinator.js";

function projectAt(id, updatedAt) {
  const project = createExampleProject();
  project.id = id;
  project.updatedAt = updatedAt;
  project.name = id;
  return project;
}

test("startup restores the most recently updated valid project", async () => {
  const older = projectAt("older", "2026-08-01T00:00:00.000Z");
  const newer = projectAt("newer", "2026-08-12T00:00:00.000Z");
  const coordinator = createSaveCoordinator({
    repository: { async list() { return { ok: true, projects: [newer, older] }; } },
    createFallback: createExampleProject,
  });

  const result = await coordinator.restore();

  assert.equal(result.source, "local");
  assert.equal(result.project.id, "newer");
  assert.equal(coordinator.isDirty(), false);
});

test("startup uses the example when storage is empty or unavailable", async () => {
  const empty = createSaveCoordinator({
    repository: { async list() { return { ok: true, projects: [] }; } },
    createFallback: () => projectAt("example", "2026-08-12T00:00:00.000Z"),
  });
  const failed = createSaveCoordinator({
    repository: { async list() { return { ok: false, code: "storage-failed", message: "blocked" }; } },
    createFallback: () => projectAt("fallback", "2026-08-12T00:00:00.000Z"),
  });

  assert.deepEqual((await empty.restore()).source, "example");
  const recovery = await failed.restore();
  assert.equal(recovery.source, "storage-error");
  assert.equal(recovery.project.id, "fallback");
  assert.match(recovery.message, /blocked/);
});

test("an edit becomes dirty and returns to saved after autosave", async () => {
  const states = [];
  const saved = [];
  const coordinator = createSaveCoordinator({
    repository: { async save(project) { saved.push(project.id); return { ok: true, id: project.id }; } },
    createFallback: createExampleProject,
    delay: 60_000,
    onState(state) { states.push(state.status); },
  });
  const project = projectAt("draft", "2026-08-12T00:00:00.000Z");

  coordinator.markChanged(project);
  assert.equal(coordinator.isDirty(), true);
  const result = await coordinator.flush();

  assert.equal(result.ok, true);
  assert.deepEqual(saved, ["draft"]);
  assert.deepEqual(states, ["dirty", "saving", "saved"]);
  assert.equal(coordinator.isDirty(), false);
});

test("a failed save remains dirty and explicit save can recover", async () => {
  let attempts = 0;
  const states = [];
  const repository = {
    async save(project) {
      attempts += 1;
      return attempts === 1
        ? { ok: false, code: "storage-failed", message: "quota blocked" }
        : { ok: true, id: project.id };
    },
  };
  const coordinator = createSaveCoordinator({ repository, createFallback: createExampleProject, delay: 60_000, onState: (state) => states.push(state) });
  const project = projectAt("recoverable", "2026-08-12T00:00:00.000Z");

  coordinator.markChanged(project);
  const failed = await coordinator.flush();
  assert.equal(failed.ok, false);
  assert.equal(coordinator.isDirty(), true);
  assert.match(states.at(-1).message, /quota blocked/);

  const recovered = await coordinator.saveNow(project);
  assert.equal(recovered.ok, true);
  assert.equal(coordinator.isDirty(), false);
});

test("disposing cancels a pending autosave", async () => {
  let writes = 0;
  const coordinator = createSaveCoordinator({
    repository: { async save() { writes += 1; return { ok: true }; } },
    createFallback: createExampleProject,
    delay: 5,
  });

  coordinator.markChanged(createExampleProject());
  coordinator.dispose();
  await new Promise((resolve) => setTimeout(resolve, 15));

  assert.equal(writes, 0);
});
