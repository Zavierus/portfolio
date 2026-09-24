import assert from "node:assert/strict";
import test from "node:test";

import {
  ASSET_CATALOG,
  createAssetDefinition,
  createAssetFromCatalog,
  listAssetDefinitions,
} from "../src/assets/asset-catalog.js";

const REQUIRED_TYPES = [
  "presenter",
  "table",
  "garment-rack",
  "backdrop",
  "monitor",
  "camera",
  "key-light",
  "rim-light",
  "ambient-light",
  "light-stand",
  "changing-zone-marker",
];

test("catalog exposes the first production asset families with complete metadata", () => {
  for (const type of REQUIRED_TYPES) {
    const definition = ASSET_CATALOG[type];
    assert.ok(definition, `missing ${type}`);
    assert.equal(definition.type, type);
    assert.equal(typeof definition.displayName, "string");
    assert.ok(definition.displayName.length > 1);
    assert.ok(definition.dimensions.width > 0);
    assert.ok(definition.dimensions.depth > 0);
    assert.ok(definition.dimensions.height > 0);
    assert.ok(definition.collisionBox.width > 0);
    assert.ok(definition.clearance >= 0);
    assert.ok(Number.isFinite(definition.cost));
    assert.ok(Array.isArray(definition.tags));
  }
});

test("asset definitions are serializable clones and aliases remain explicit", () => {
  const first = createAssetDefinition("table");
  const second = createAssetDefinition("table");
  first.dimensions.width = 99;
  first.tags.push("mutated");

  assert.notEqual(first, second);
  assert.notEqual(first.dimensions, second.dimensions);
  assert.notEqual(second.dimensions.width, 99);
  assert.equal(createAssetDefinition("live-table").type, "live-table");
  assert.equal(JSON.parse(JSON.stringify(second)).type, "table");
});

test("catalog listing is stable and unknown assets fail clearly", () => {
  const types = listAssetDefinitions().map((definition) => definition.type);
  assert.deepEqual(types, [...types].sort());
  assert.throws(() => createAssetDefinition("teleporter"), /未知资产类型/);
});

test("catalog creates a valid floor asset without sharing definition state", () => {
  const asset = createAssetFromCatalog("rim-light", {
    id: "rim-light-new",
    name: "后侧轮廓光",
    position: { x: 0.8, z: -0.4 },
  });

  assert.equal(asset.id, "rim-light-new");
  assert.equal(asset.name, "后侧轮廓光");
  assert.equal(asset.transform.position.y, asset.dimensions.height / 2);
  assert.deepEqual(asset.transform.rotation, { x: 0, y: 0, z: 0 });
  assert.equal(asset.locked, false);
  asset.tags.push("local");
  assert.equal(ASSET_CATALOG["rim-light"].tags.includes("local"), false);
  assert.throws(() => createAssetFromCatalog("monitor", {}), /唯一标识/);
});
