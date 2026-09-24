import assert from "node:assert/strict";
import test from "node:test";

import {
  ALLOWED_ASSET_LICENSES,
  summarizeAssetBudget,
  validateAssetManifest,
} from "../src/shared/assets/asset-contract.js";

function validManifest() {
  return {
    contractVersion: 1,
    project: "relic-01",
    assets: [{
      id: "relic-artifact",
      type: "model",
      published: true,
      source: {
        url: "https://example.com/licensed-source",
        author: "Example Artist",
        license: "CC-BY-4.0",
        path: "assets/source/relic-01/blender/relic-01.blend",
      },
      lods: [
        { level: "high", path: "assets/runtime/relic-01/models/relic-high.glb", triangles: 170000, bytes: 12000000 },
        { level: "low", path: "assets/runtime/relic-01/models/relic-low.glb", triangles: 56000, bytes: 5200000 },
      ],
      textures: [{
        role: "baseColor",
        sourcePath: "assets/source/relic-01/textures/base-color.png",
        runtimePath: "assets/runtime/relic-01/textures/base-color.ktx2",
        width: 4096,
        height: 4096,
        colorSpace: "srgb",
        format: "ktx2",
        bytes: 2400000,
      }],
      animations: ["membrane_tension", "core_wake"],
    }],
  };
}

test("production asset contract accepts a fully attributed published model", () => {
  const result = validateAssetManifest(validManifest());
  assert.deepEqual(result.errors, []);
  assert.equal(result.items.length, 1);
  assert.ok(ALLOWED_ASSET_LICENSES.includes("CC0-1.0"));
  assert.ok(ALLOWED_ASSET_LICENSES.includes("PURCHASED"));
});

test("unpublished source records can omit runtime lods", () => {
  const manifest = validManifest();
  manifest.assets[0].published = false;
  manifest.assets[0].lods = [];
  manifest.assets[0].textures[0].runtimePath = null;
  manifest.assets[0].textures[0].bytes = 0;
  const result = validateAssetManifest(manifest);
  assert.deepEqual(result.errors, []);
});

test("original authored assets do not need a fabricated external source URL", () => {
  const manifest = validManifest();
  manifest.assets[0].source = {
    origin: "authored",
    author: "Zeno / Wang Zeyuan",
    license: "CUSTOM-PERMISSIVE",
    path: "assets/source/pulse-room/worlds/signal-chrysalis.source.json",
  };
  assert.deepEqual(validateAssetManifest(manifest).errors, []);

  manifest.assets[0].source.license = "CC0-1.0";
  assert.ok(validateAssetManifest(manifest).errors.some(({ field }) => field === "source.url"));
});

test("asset contract reports duplicate ids, unsafe paths, and unsupported licenses", () => {
  const manifest = validManifest();
  const duplicate = structuredClone(manifest.assets[0]);
  duplicate.source.license = "UNKNOWN";
  duplicate.source.path = "../outside.blend";
  duplicate.lods[0].path = "https://cdn.example.com/model.glb";
  manifest.assets.push(duplicate);
  const result = validateAssetManifest(manifest);
  const fields = result.errors.map(({ field }) => field);
  assert.ok(fields.includes("id"));
  assert.ok(fields.includes("source.license"));
  assert.ok(fields.includes("source.path"));
  assert.ok(fields.includes("lods[0].path"));
});

test("published assets require positive lod and texture metrics", () => {
  const manifest = validManifest();
  manifest.assets[0].lods[0].triangles = 0;
  manifest.assets[0].textures[0].width = -1;
  manifest.assets[0].animations = ["core_wake", "core_wake"];
  const result = validateAssetManifest(manifest);
  const fields = result.errors.map(({ field }) => field);
  assert.ok(fields.includes("lods[0].triangles"));
  assert.ok(fields.includes("textures[0].width"));
  assert.ok(fields.includes("animations"));
});

test("asset budget summarizes bytes and triangles by project and lod", () => {
  const result = validateAssetManifest(validManifest());
  assert.deepEqual(summarizeAssetBudget(result.items), {
    project: "relic-01",
    assetCount: 1,
    textureBytes: 2400000,
    lods: {
      high: { bytes: 12000000, triangles: 170000 },
      low: { bytes: 5200000, triangles: 56000 },
    },
  });
});
