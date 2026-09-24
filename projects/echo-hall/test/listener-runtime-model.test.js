import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  LISTENER_RUNTIME_CONTRACT,
  validateListenerArtifactModels,
} from "../../../scripts/validate-listener-artifact.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

test("optimized Listener GLBs preserve the authored runtime contract", async () => {
  const result = await validateListenerArtifactModels({ repositoryRoot });

  assert.deepEqual(result.errors, []);
  assert.equal(result.reports.length, 2);
  for (const report of result.reports) {
    const [minimum, maximum] = LISTENER_RUNTIME_CONTRACT.triangleBounds[report.level];
    assert.ok(report.triangles >= minimum && report.triangles <= maximum);
    assert.deepEqual(report.morphs, [...LISTENER_RUNTIME_CONTRACT.morphs].sort());
    assert.deepEqual(report.materials, [...LISTENER_RUNTIME_CONTRACT.materials].sort());
    assert.ok(report.bytes > 0);
    assert.ok(report.dimensions.every((value) => Number.isFinite(value) && value > 0));
  }
});
