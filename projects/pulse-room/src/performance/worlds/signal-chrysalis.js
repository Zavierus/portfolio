import * as THREE from "three";

import { loadPulseWorldAsset } from "../../assets/runtime-loader.js";
import { disposeObjectTree } from "../resource-disposal.js";

const TAU = Math.PI * 2;
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.min(1, Math.max(0, finite(value)));

function sectionOffset(section) {
  const source = typeof section === "string" ? section : "realtime";
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 0xffffffff;
}

export function computeSignalChrysalisState(signal = {}) {
  const time = Math.max(0, finite(signal.time));
  const low = clamp01(signal.low);
  const mid = clamp01(signal.mid);
  const high = clamp01(signal.high);
  const onset = clamp01(signal.onset);
  const centroid = clamp01(signal.spectralCentroid);
  const barPhase = clamp01(signal.barPhase);
  const offset = sectionOffset(signal.section);

  return Object.freeze({
    shellCompress: clamp01(0.08 + low * 0.78 + onset * 0.08),
    plateSplit: clamp01(0.04 + mid * 0.48 + onset * 0.78),
    nerveSweep: clamp01(0.06 + high * 0.68 + centroid * 0.32),
    scarIdle: clamp01(0.18 + Math.sin(time * 0.72 + barPhase * TAU + offset * TAU) * 0.12 + high * 0.16),
    cameraImpulse: clamp01(onset * 0.12),
    sectionOffset: offset,
    rootYaw: Math.sin(time * 0.085 + offset * TAU) * 0.055,
  });
}

function bindMorphTargets(root) {
  const bindings = new Map();
  root.traverse((node) => {
    for (const [name, index] of Object.entries(node.morphTargetDictionary ?? {})) {
      const list = bindings.get(name) ?? [];
      list.push({ node, index });
      bindings.set(name, list);
    }
  });
  return bindings;
}

function setMorph(bindings, name, value) {
  for (const { node, index } of bindings.get(name) ?? []) node.morphTargetInfluences[index] = value;
}

export function createSignalChrysalisPerformance({ stage, asset }) {
  if (!stage?.scene || !stage?.camera) throw new TypeError("SIGNAL CHRYSALIS requires a VJ stage");
  if (!asset?.gltf?.scene || !asset?.root) throw new TypeError("SIGNAL CHRYSALIS requires a loaded runtime asset");

  const world = asset.gltf.scene;
  const root = asset.root;
  const bindings = bindMorphTargets(root);
  const materials = new Map();
  const bloomObjects = [];
  world.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = stage.quality?.shadows ?? false;
    node.receiveShadow = true;
    const candidates = Array.isArray(node.material) ? node.material : [node.material];
    for (const material of candidates) {
      if (!material || materials.has(material)) continue;
      materials.set(material, {
        opacity: material.opacity,
        transparent: material.transparent,
        emissiveIntensity: (material.emissiveIntensity ?? 0) * (/Nerve|Scar/i.test(node.name) ? 2.3 : 1),
      });
    }
    if (/Nerve|Scar/i.test(node.name)) bloomObjects.push(node);
  });

  const lights = new THREE.Group();
  lights.name = "SIGNAL_CHRYSALIS_LIGHTS";
  lights.add(new THREE.HemisphereLight(0xc8d4cc, 0x08050d, 1.6));
  const key = new THREE.DirectionalLight(0xe9efe7, 7.2);
  key.position.set(-3.5, 4.2, 8.5);
  key.castShadow = stage.quality?.shadows ?? false;
  lights.add(key);
  const nerveLight = new THREE.PointLight(0xd9ff32, 18, 14, 2);
  nerveLight.position.set(1.8, 0.8, 3.8);
  lights.add(nerveLight);
  const violetRim = new THREE.PointLight(0x7557ff, 22, 16, 2);
  violetRim.position.set(-3.5, 1.8, -4.8);
  lights.add(violetRim);
  const cyanFill = new THREE.PointLight(0x44e7ff, 12, 13, 2);
  cyanFill.position.set(4.5, -0.4, 5.5);
  lights.add(cyanFill);

  const current = { shellCompress: 0, plateSplit: 0, nerveSweep: 0, scarIdle: 0 };
  let envelope = 0;
  let mounted = false;
  let disposed = false;
  let currentTime = 0;

  const applyEnvelope = () => {
    for (const [material, base] of materials) {
      material.opacity = base.opacity * envelope;
      material.transparent = envelope < 0.999 || base.transparent;
      material.emissiveIntensity = base.emissiveIntensity * envelope;
      material.needsUpdate = true;
    }
    nerveLight.intensity = 18 * envelope;
    violetRim.intensity = 22 * envelope;
  };

  return {
    mount() {
      if (mounted || disposed) return false;
      mounted = true;
      world.scale.set(1.05, stage.camera.aspect < 0.8 ? 1.55 : 1.24, 1.05);
      world.position.set(0, -0.1, 0);
      stage.scene.add(world, lights);
      bloomObjects.forEach((object) => stage.addBloom?.(object));
      stage.camera.position.set(0.35, 0.42, stage.camera.aspect < 0.8 ? 24.5 : 10.1);
      stage.camera.lookAt(0, 0, 0);
      applyEnvelope();
      return true;
    },
    setEnvelope(value) {
      envelope = clamp01(value);
      applyEnvelope();
    },
    update(frame = {}, delta = 1 / 60) {
      if (!mounted || disposed) return false;
      const signal = frame.signal ?? frame.vjSignal ?? frame;
      const state = computeSignalChrysalisState(signal);
      currentTime = Math.max(0, finite(frame.currentTime, signal.time));
      const response = Math.min(1, Math.max(0, delta) * 9.5);
      for (const keyName of Object.keys(current)) current[keyName] += (state[keyName] - current[keyName]) * response;
      setMorph(bindings, "shell_compress", current.shellCompress);
      setMorph(bindings, "plate_split", current.plateSplit);
      setMorph(bindings, "nerve_sweep", current.nerveSweep);
      setMorph(bindings, "scar_idle", current.scarIdle);
      root.rotation.y = state.rootYaw;
      root.rotation.x = Math.sin(currentTime * 0.11) * 0.025;
      nerveLight.intensity = (12 + state.nerveSweep * 18) * envelope;

      if (stage.quality?.cameraTravel) {
        const drift = (state.sectionOffset - 0.5) * 0.55;
        const impulse = stage.quality?.impactShake ? state.cameraImpulse : 0;
        stage.camera.position.x = drift + Math.sin(currentTime * 0.13) * 0.18 + Math.sin(currentTime * 43) * impulse;
        stage.camera.position.y = 0.42 + Math.cos(currentTime * 0.09) * 0.12;
        const framingDistance = stage.camera.aspect < 0.8 ? 24.5 : 10.1;
        stage.camera.position.z = framingDistance - state.shellCompress * 0.4;
      }
      stage.camera.lookAt(0, 0, 0);
      return true;
    },
    pause() {},
    resume() {},
    seek(time) {
      currentTime = Math.max(0, finite(time));
      return true;
    },
    dispose() {
      if (disposed) return false;
      disposed = true;
      bloomObjects.forEach((object) => stage.removeBloom?.(object));
      stage.scene.remove(world, lights);
      disposeObjectTree(world);
      for (const light of lights.children) light.dispose?.();
      return true;
    },
  };
}

export async function loadSignalChrysalisModule({ stage, onProgress } = {}) {
  const asset = await loadPulseWorldAsset({
    worldId: "signal-chrysalis",
    renderer: stage?.renderer,
    quality: stage?.quality,
    onProgress,
    transcoderPath: "./assets/basis/",
  });
  return Object.freeze({
    createPerformance: () => createSignalChrysalisPerformance({ stage, asset }),
  });
}
