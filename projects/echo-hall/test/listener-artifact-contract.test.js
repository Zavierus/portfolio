import assert from "node:assert/strict";
import test from "node:test";

import {
  LISTENER_ARTIFACT_CONTRACT,
  ListenerArtifactContractError,
  resolveListenerAssetManifest,
  validateListenerArtifactScene,
} from "../src/assets/listener-artifact-contract.js";

const listenerEntry = Object.freeze({
  id: "listener-artifact",
  file: "models/listener-artifact-high.glb",
  bytes: 8_000_000,
  lods: Object.freeze({
    high: Object.freeze({
      file: "models/listener-artifact-high.glb",
      bytes: 8_000_000,
      triangles: 120_000,
    }),
    low: Object.freeze({
      file: "models/listener-artifact-low.glb",
      bytes: 3_000_000,
      triangles: 38_000,
    }),
  }),
});

function createValidScene({ missingMorph, missingMaterial } = {}) {
  const materialNodes = LISTENER_ARTIFACT_CONTRACT.materials
    .filter((name) => name !== missingMaterial)
    .map((name) => ({ isMesh: true, material: { name } }));
  const morphNodes = LISTENER_ARTIFACT_CONTRACT.morphs
    .filter((name) => name !== missingMorph)
    .map((name) => ({
      isMesh: true,
      morphTargetDictionary: { unrelated: 0, [name]: 1 },
      morphTargetInfluences: [0.25, 0],
      material: materialNodes.shift()?.material,
    }));
  const descendants = [...morphNodes, ...materialNodes];
  const root = {
    name: LISTENER_ARTIFACT_CONTRACT.root,
    traverse(visitor) {
      visitor(this);
      descendants.forEach(visitor);
    },
  };

  return {
    root,
    scene: {
      getObjectByName(name) {
        return name === root.name ? root : null;
      },
      traverse(visitor) {
        visitor(this);
        root.traverse(visitor);
      },
    },
  };
}

test("quality resolves one compatible Listener LOD without mutating the manifest", () => {
  const lighting = Object.freeze({
    id: "lighting",
    file: "textures/studio.hdr",
    bytes: 100,
  });
  const manifest = Object.freeze([lighting, listenerEntry]);

  for (const [level, suffix] of [["high", "high"], ["medium", "high"], ["low", "low"]]) {
    const resolved = resolveListenerAssetManifest(manifest, level);
    const listener = resolved.find(({ id }) => id === "listener-artifact");

    assert.match(listener.file, new RegExp(`-${suffix}\\.glb$`));
    assert.equal(listener.bytes, listenerEntry.lods[suffix].bytes);
    assert.equal(resolved.filter(({ id }) => id === "listener-artifact").length, 1);
    assert.equal(resolved[0], lighting, "unrelated manifest entries retain their identity");
    assert.notEqual(listener, listenerEntry, "the selected Listener entry is cloned");
  }

  assert.equal(listenerEntry.file, "models/listener-artifact-high.glb");
  assert.equal(listenerEntry.bytes, 8_000_000);
});

test("the authored asset contract exposes stable frozen names", () => {
  assert.equal(LISTENER_ARTIFACT_CONTRACT.root, "LISTENER_ARTIFACT_ROOT");
  assert.deepEqual(LISTENER_ARTIFACT_CONTRACT.morphs, [
    "shell_open",
    "membrane_tension",
    "core_exposure",
    "balance_shift",
    "signal_sweep",
  ]);
  assert.deepEqual(LISTENER_ARTIFACT_CONTRACT.materials, [
    "MAT_CERAMIC_SHELL",
    "MAT_TITANIUM_SPINE",
    "MAT_SIGNAL_MEMBRANE",
    "MAT_ARCHIVE_CORE",
    "MAT_ACID_SIGNAL",
  ]);
  assert.ok(Object.isFrozen(LISTENER_ARTIFACT_CONTRACT));
  assert.ok(Object.isFrozen(LISTENER_ARTIFACT_CONTRACT.morphs));
  assert.ok(Object.isFrozen(LISTENER_ARTIFACT_CONTRACT.materials));
});

test("runtime validation returns frozen morph and material bindings", () => {
  const { scene, root } = createValidScene();
  const result = validateListenerArtifactScene(scene);

  assert.equal(result.root, root);
  assert.ok(Object.isFrozen(result));
  assert.ok(Object.isFrozen(result.morphBindings));
  assert.ok(Object.isFrozen(result.materials));
  for (const morph of LISTENER_ARTIFACT_CONTRACT.morphs) {
    assert.equal(result.morphBindings[morph].length, 1);
    assert.equal(result.morphBindings[morph][0].index, 1);
    assert.ok(Object.isFrozen(result.morphBindings[morph]));
  }
  assert.deepEqual(
    result.materials.map(({ name }) => name).sort(),
    [...LISTENER_ARTIFACT_CONTRACT.materials].sort(),
  );
});

test("runtime validation reports a missing root", () => {
  const fakeScene = { getObjectByName: () => null, traverse() {} };
  assert.throws(
    () => validateListenerArtifactScene(fakeScene),
    (error) => error instanceof ListenerArtifactContractError
      && error.code === "MISSING_ROOT"
      && error.details.expected === LISTENER_ARTIFACT_CONTRACT.root,
  );
});

test("runtime validation reports all missing morphs as one structured error", () => {
  const { scene } = createValidScene({ missingMorph: "core_exposure" });
  assert.throws(
    () => validateListenerArtifactScene(scene),
    (error) => error instanceof ListenerArtifactContractError
      && error.code === "MISSING_MORPHS"
      && assert.deepEqual(error.details.missing, ["core_exposure"]) === undefined,
  );
});

test("runtime validation reports all missing materials as one structured error", () => {
  const { scene } = createValidScene({ missingMaterial: "MAT_ARCHIVE_CORE" });
  assert.throws(
    () => validateListenerArtifactScene(scene),
    (error) => error instanceof ListenerArtifactContractError
      && error.code === "MISSING_MATERIALS"
      && assert.deepEqual(error.details.missing, ["MAT_ARCHIVE_CORE"]) === undefined,
  );
});
