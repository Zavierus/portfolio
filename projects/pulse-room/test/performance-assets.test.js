import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  PulseWorldAssetError,
  selectPulseWorldAsset,
  validatePulseWorldAssetContract,
} from "../src/assets/runtime-loader.js";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const manifestPath = path.join(repositoryRoot, "projects/pulse-room/assets/asset-manifest.json");
const expected = Object.freeze({
  "signal-chrysalis": ["SIGNAL_CHRYSALIS_ROOT", "shell_compress", "plate_split", "nerve_sweep", "scar_idle"],
  "triune-gate": ["TRIUNE_GATE_ROOT", "left_strike", "center_strike", "right_strike", "gate_lock", "cable_tension"],
  "null-cathedral": ["NULL_CATHEDRAL_ROOT", "shell_reveal", "void_cross", "scale_reveal", "relic_idle"],
  "packet-bloom": ["PACKET_BLOOM_ROOT", "lattice_bend", "cluster_break", "cluster_rebuild", "packet_idle"],
});

test("PULSE manifest reserves four licensed authored worlds and two LOD targets", async () => {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert.equal(manifest.contractVersion, 1);
  assert.equal(manifest.project, "pulse-room");
  assert.deepEqual(manifest.assets.map(({ id }) => id), Object.keys(expected));

  for (const asset of manifest.assets) {
    const [root, ...controls] = expected[asset.id];
    assert.equal(asset.root, root);
    assert.deepEqual(asset.controls, controls);
    assert.deepEqual(asset.animations, controls);
    assert.equal(asset.source.origin, "authored");
    assert.equal(asset.source.license, "CUSTOM-PERMISSIVE");
    assert.match(asset.source.path, /^assets\/source\/pulse-room\/worlds\/[a-z-]+\.source\.json$/);
    await access(path.join(repositoryRoot, asset.source.path));
    const sourceRecord = JSON.parse(await readFile(path.join(repositoryRoot, asset.source.path), "utf8"));
    assert.equal(asset.published, sourceRecord.status === "published");
    assert.deepEqual(asset.lods.map(({ level }) => level), ["high", "low"]);
    for (const lod of asset.lods) {
      assert.match(lod.path, new RegExp(`^assets/runtime/pulse-room/models/${asset.id}-${lod.level}\\.glb$`));
      assert.ok(Number.isInteger(lod.triangles) && lod.triangles > 0);
      assert.ok(Number.isInteger(lod.bytes) && lod.bytes > 0 && lod.bytes <= 5 * 1024 * 1024);
      if (asset.published) {
        const runtimeFile = await stat(path.join(repositoryRoot, lod.path));
        assert.equal(runtimeFile.size, lod.bytes);
        assert.equal(lod.metricsStatus, "measured");
      } else {
        assert.equal(lod.metricsStatus, "budget");
      }
    }
  }
});

function makeGltf(worldId) {
  const [rootName, ...controls] = expected[worldId];
  const root = {
    traverse(visitor) {
      visitor(this);
      visitor({ morphTargetDictionary: Object.fromEntries(controls.map((name, index) => [name, index])) });
    },
  };
  return {
    scene: { getObjectByName: (name) => name === rootName ? root : null },
    animations: controls.map((name) => ({ name })),
  };
}

test("runtime contracts require the named root, controls, and animation clips", () => {
  const result = validatePulseWorldAssetContract(makeGltf("signal-chrysalis"), "signal-chrysalis");
  assert.equal(result.rootName, "SIGNAL_CHRYSALIS_ROOT");
  assert.equal(result.animations.length, 4);

  const invalid = makeGltf("signal-chrysalis");
  invalid.animations.pop();
  assert.throws(
    () => validatePulseWorldAssetContract(invalid, "signal-chrysalis"),
    (error) => error instanceof PulseWorldAssetError && error.code === "MISSING_ANIMATION",
  );
});

test("runtime selection follows quality LOD and returns a local project URL", () => {
  assert.deepEqual(selectPulseWorldAsset("packet-bloom", { lod: "high" }), {
    id: "packet-bloom",
    lod: "high",
    url: "../../assets/runtime/pulse-room/models/packet-bloom-high.glb",
  });
  assert.equal(selectPulseWorldAsset("packet-bloom", { lod: "low" }).lod, "low");
  assert.throws(() => selectPulseWorldAsset("unknown", { lod: "high" }), /Unknown PULSE world/);
});
