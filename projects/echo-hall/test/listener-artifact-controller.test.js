import assert from "node:assert/strict";
import test from "node:test";

import { ListenerArtifactController } from "../src/listener/listener-artifact-controller.js";

const MORPHS = ["shell_open", "membrane_tension", "core_exposure", "balance_shift", "signal_sweep"];
const MATERIALS = [
  "MAT_CERAMIC_SHELL",
  "MAT_TITANIUM_SPINE",
  "MAT_SIGNAL_MEMBRANE",
  "MAT_ARCHIVE_CORE",
  "MAT_ACID_SIGNAL",
];

function createFixture() {
  const disposeCounts = { geometry: 0, material: 0, texture: 0 };
  const texture = { isTexture: true, dispose: () => { disposeCounts.texture += 1; } };
  const materials = MATERIALS.map((name, index) => ({
    name,
    opacity: 0.45 + index * 0.1,
    emissiveIntensity: index * 0.25,
    map: texture,
    dispose: () => { disposeCounts.material += 1; },
  }));
  const geometry = { dispose: () => { disposeCounts.geometry += 1; } };
  const influences = [0, 0, 0, 0, 0];
  const mesh = {
    isMesh: true,
    geometry,
    material: materials,
    morphTargetDictionary: Object.fromEntries(MORPHS.map((name, index) => [name, index])),
    morphTargetInfluences: influences,
  };
  const root = {
    name: "LISTENER_ARTIFACT_ROOT",
    position: { values: [], fromArray(values) { this.values = [...values]; } },
    rotation: { x: 0.25, y: 0, z: -0.15 },
    scale: { values: [1, 1, 1], multiplyScalar(value) { this.values = this.values.map((item) => item * value); } },
    traverse(visitor) { visitor(this); visitor(mesh); },
  };
  const gltfScene = {
    getObjectByName(name) { return name === root.name ? root : null; },
    traverse(visitor) { visitor(this); root.traverse(visitor); },
  };
  const scene = {
    children: [],
    add(object) { if (!this.children.includes(object)) this.children.push(object); },
    remove(object) { this.children = this.children.filter((child) => child !== object); },
  };
  return { scene, gltfScene, root, influences, materials, disposeCounts };
}

test("controller maps film state directly to authored morphs", () => {
  const fixture = createFixture();
  const controller = new ListenerArtifactController({
    scene: fixture.scene,
    asset: { gltf: { scene: fixture.gltfScene } },
    quality: "high",
  });

  controller.update({
    position: [-2, 0.5, 1],
    rotationY: -0.4,
    shellSeparation: 0.2,
    archiveOpen: 0.8,
    membraneTension: 0.6,
    coreExposure: 0.75,
    balanceOffset: 0.4,
    scanResponse: 0.5,
  });

  assert.deepEqual(fixture.influences, [0.8, 0.6, 0.75, 0.4, 0.5]);
  assert.deepEqual(fixture.root.position.values, [-2, 0.5, 1]);
  assert.equal(fixture.root.rotation.y, -0.4);
  assert.equal(fixture.root.rotation.x, 0.25);
  assert.equal(fixture.root.rotation.z, -0.15);
  assert.deepEqual(fixture.root.scale.values, [0.42, 0.42, 0.42]);
});

test("identical state samples are deterministic and preserve authored material response", () => {
  const fixture = createFixture();
  const controller = new ListenerArtifactController({ scene: fixture.scene, asset: { gltf: { scene: fixture.gltfScene } } });
  const state = {
    position: [0, 0, 0],
    rotationY: 0.2,
    archiveOpen: 2,
    membraneTension: -1,
    coreExposure: 0.4,
    balanceOffset: 0.3,
    scanResponse: 0.7,
  };
  const baseMaterials = fixture.materials.map(({ opacity, emissiveIntensity }) => ({ opacity, emissiveIntensity }));

  controller.update(state);
  const first = [...fixture.influences];
  controller.update(state);

  assert.deepEqual(fixture.influences, first);
  assert.deepEqual(first, [1, 0, 0.4, 0.3, 0.7]);
  assert.deepEqual(
    fixture.materials.map(({ opacity, emissiveIntensity }) => ({ opacity, emissiveIntensity })),
    baseMaterials,
  );
});

test("mount and dispose are idempotent and release shared resources once", () => {
  const fixture = createFixture();
  const controller = new ListenerArtifactController({ scene: fixture.scene, asset: { gltf: { scene: fixture.gltfScene } } });

  controller.mount();
  assert.deepEqual(fixture.scene.children, [fixture.gltfScene]);
  controller.dispose();
  controller.dispose();

  assert.deepEqual(fixture.scene.children, []);
  assert.deepEqual(fixture.disposeCounts, { geometry: 1, material: MATERIALS.length, texture: 1 });
});
