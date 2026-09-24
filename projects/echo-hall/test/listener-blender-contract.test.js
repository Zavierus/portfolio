import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repositoryRoot = path.resolve(import.meta.dirname, "../../..");
const blender = process.env.BLENDER_BIN ?? path.join(
  process.env.LOCALAPPDATA ?? "",
  "Programs/Blender/blender-4.5.12-windows-x64/blender.exe",
);
const blend = path.join(repositoryRoot, "assets/source/echo-hall/blender/listener-artifact.blend");
const exporter = path.join(repositoryRoot, "scripts/blender/listener_artifact_export.py");
const expectedMorphs = ["shell_open", "membrane_tension", "core_exposure", "balance_shift", "signal_sweep"];
const expectedMaterials = ["MAT_CERAMIC_SHELL", "MAT_TITANIUM_SPINE", "MAT_SIGNAL_MEMBRANE", "MAT_ARCHIVE_CORE", "MAT_ACID_SIGNAL"];

function validateLod(lod) {
  assert.ok(existsSync(blender), `Blender executable is missing: ${blender}`);
  const result = spawnSync(blender, [
    "--background",
    blend,
    "--python",
    exporter,
    "--",
    "--lod",
    lod,
    "--validate-only",
  ], { cwd: repositoryRoot, encoding: "utf8", timeout: 120_000 });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const line = result.stdout.split(/\r?\n/).find((entry) => entry.startsWith("LISTENER_CONTRACT_JSON "));
  assert.ok(line, "Exporter must print LISTENER_CONTRACT_JSON");
  return JSON.parse(line.slice("LISTENER_CONTRACT_JSON ".length));
}

for (const lod of ["high", "low"]) {
  test(`Listener Blender source satisfies the ${lod} export contract`, () => {
    const report = validateLod(lod);
    assert.equal(report.root, "LISTENER_ARTIFACT_ROOT");
    assert.equal(report.lod, lod);
    assert.deepEqual(report.morphs, expectedMorphs);
    assert.deepEqual(report.materials, expectedMaterials);
    assert.ok(Number.isInteger(report.triangles));
    const [minimum, maximum] = lod === "high" ? [90_000, 150_000] : [28_000, 45_000];
    assert.ok(report.triangles >= minimum && report.triangles <= maximum, `${lod}: ${report.triangles}`);
    assert.equal(report.bounds.length, 3);
    assert.ok(report.bounds.every((value) => Number.isFinite(value) && value > 0));
    assert.ok(report.morphSamplesFinite);
  });
}
