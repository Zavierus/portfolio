import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { MAX_RUNTIME_BYTES, validateEchoAssetManifest } from "../../../scripts/validate-echo-assets.mjs";

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsDirectory = path.join(projectDirectory, "assets");
const manifestPath = path.join(assetsDirectory, "asset-manifest.json");
const attributionsPath = path.join(assetsDirectory, "ATTRIBUTIONS.md");
const requiredFields = [
  "id",
  "file",
  "type",
  "creator",
  "sourceUrl",
  "license",
  "licenseUrl",
  "modifications",
  "usage",
  "critical",
  "bytes",
];

test("Listener runtime assets are local, licensed, attributed, and within budget", async () => {
  const [manifestSource, attributions] = await Promise.all([
    readFile(manifestPath, "utf8"),
    readFile(attributionsPath, "utf8"),
  ]);
  const manifest = JSON.parse(manifestSource);
  const result = await validateEchoAssetManifest(manifest, {
    assetsDirectory,
    attributions,
  });

  assert.deepEqual(result.errors, []);
  assert.ok(result.totalBytes > 0);
  assert.ok(result.totalBytes <= MAX_RUNTIME_BYTES);
  const expectedBytes = manifest.reduce((sum, entry) => sum + (entry.lods
    ? Object.values(entry.lods).reduce((lodSum, lod) => lodSum + lod.bytes, 0)
    : entry.bytes), 0);
  assert.equal(result.totalBytes, expectedBytes);
  for (const entry of manifest) {
    for (const field of requiredFields) assert.ok(Object.hasOwn(entry, field), `${entry.id ?? "asset"} lacks ${field}`);
    assert.match(attributions, new RegExp(`\\b${entry.id}\\b`));
  }
});

test("Listener asset validation rejects unsafe paths, unknown licenses, and false byte metadata", async () => {
  const fixture = {
    id: "unsafe-fixture",
    file: "https://cdn.example.test/runner.glb",
    type: "model",
    creator: "Fixture Author",
    sourceUrl: "https://example.test/asset",
    license: "All Rights Reserved",
    licenseUrl: "https://example.test/license",
    modifications: "None",
    usage: "Test only",
    critical: true,
    bytes: MAX_RUNTIME_BYTES + 1,
  };
  const result = await validateEchoAssetManifest([fixture], {
    assetsDirectory,
    attributions: "",
    checkFiles: false,
  });

  assert.ok(result.errors.some((error) => error.includes("local path")));
  assert.ok(result.errors.some((error) => error.includes("allowed license")));
  assert.ok(result.errors.some((error) => error.includes("attribution")));
  assert.ok(result.errors.some((error) => error.includes("35 MB")));
});

test("Listener asset validation rejects traversal and duplicate IDs", async () => {
  const fixture = {
    id: "duplicate",
    file: "../outside.glb",
    type: "model",
    creator: "Fixture Author",
    sourceUrl: "https://example.test/asset",
    license: "CC0-1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    modifications: "None",
    usage: "Test only",
    critical: true,
    bytes: 1,
  };
  const result = await validateEchoAssetManifest([fixture, { ...fixture, file: "models/runner.glb" }], {
    assetsDirectory,
    attributions: "duplicate",
    checkFiles: false,
  });

  assert.ok(result.errors.some((error) => error.includes("traversal")));
  assert.ok(result.errors.some((error) => error.includes("Duplicate asset id")));
});

test("Listener asset validation checks every LOD and high-LOD mirrors", async () => {
  const fixture = {
    id: "lod-fixture",
    file: "models/high.glb",
    type: "model",
    creator: "Fixture Author",
    sourceUrl: "/scripts/build-listener-artifact.mjs",
    license: "CC0-1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    modifications: "None",
    usage: "Test only",
    critical: true,
    bytes: 10,
    lods: {
      high: { file: "models/high.glb", bytes: 11, triangles: 120_000 },
      low: { file: "../low.glb", bytes: 0, triangles: -1 },
    },
  };
  const result = await validateEchoAssetManifest([fixture], {
    assetsDirectory,
    attributions: "lod-fixture",
    checkFiles: false,
  });

  assert.ok(result.errors.some((error) => error.includes("low LOD file contains path traversal")));
  assert.ok(result.errors.some((error) => error.includes("low LOD bytes must be a positive integer")));
  assert.ok(result.errors.some((error) => error.includes("low LOD triangles must be a positive integer")));
  assert.ok(result.errors.some((error) => error.includes("mirror the high LOD")));
});

test("Listener environment and audio files use production formats", async () => {
  const hdri = await readFile(path.join(assetsDirectory, "textures", "studio-small-09-1k.hdr"));
  assert.match(hdri.toString("ascii", 0, 16), /^#\?RADIANCE/);
  for (const file of ["breathing.wav", "facility-ambience.wav", "resonance-score.wav"]) {
    const wav = await readFile(path.join(assetsDirectory, "audio", file));
    assert.equal(wav.toString("ascii", 0, 4), "RIFF");
    assert.equal(wav.toString("ascii", 8, 12), "WAVE");
  }
});
