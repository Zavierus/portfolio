import assert from "node:assert/strict";
import test from "node:test";

import { createExampleProject } from "../src/domain/example-project.js";
import { createProjectRepository } from "../src/persistence/project-repository.js";

function memoryAdapter() {
  const records = new Map();
  return {
    async put(record) { records.set(record.id, structuredClone(record)); },
    async get(id) { return records.has(id) ? structuredClone(records.get(id)) : null; },
    async getAll() { return [...records.values()].map((record) => structuredClone(record)); },
    async delete(id) { records.delete(id); },
  };
}

test("repository saves, lists, loads and deletes isolated project copies", async () => {
  const repository = createProjectRepository(memoryAdapter());
  const project = createExampleProject();

  assert.deepEqual(await repository.save(project), { ok: true, id: project.id });
  project.room.width = 99;

  const loaded = await repository.load(project.id);
  assert.equal(loaded.ok, true);
  assert.equal(loaded.project.room.width, 3.8);

  const listed = await repository.list();
  assert.equal(listed.ok, true);
  assert.equal(listed.projects.length, 1);
  assert.equal(listed.projects[0].id, project.id);

  assert.deepEqual(await repository.delete(project.id), { ok: true, id: project.id });
  assert.equal((await repository.load(project.id)).code, "not-found");
});

test("repository rejects invalid records without calling storage", async () => {
  let writes = 0;
  const adapter = memoryAdapter();
  const repository = createProjectRepository({
    ...adapter,
    async put(record) { writes += 1; return adapter.put(record); },
  });
  const project = createExampleProject();
  project.room.depth = 0;

  const result = await repository.save(project);

  assert.equal(result.ok, false);
  assert.equal(result.code, "invalid-project");
  assert.equal(writes, 0);
});

test("repository converts storage exceptions into recoverable results", async () => {
  const failure = new Error("quota blocked");
  const repository = createProjectRepository({
    async put() { throw failure; },
    async get() { throw failure; },
    async getAll() { throw failure; },
    async delete() { throw failure; },
  });

  const save = await repository.save(createExampleProject());
  const list = await repository.list();

  assert.equal(save.code, "storage-failed");
  assert.match(save.message, /quota blocked/);
  assert.equal(list.code, "storage-failed");
});
