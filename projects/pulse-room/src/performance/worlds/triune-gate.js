import * as THREE from "three";

import { loadPulseWorldAsset } from "../../assets/runtime-loader.js";
import { disposeObjectTree } from "../resource-disposal.js";

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.min(1, Math.max(0, finite(value)));

export function computeTriuneGateState(signal = {}) {
  const time = Math.max(0, finite(signal.time));
  const onset = clamp01(signal.onset);
  const low = clamp01(signal.low);
  const mid = clamp01(signal.mid);
  const high = clamp01(signal.high);
  const activeBody = Math.floor(time * 160 / 60) % 3;
  const strikes = [0, 1, 2].map((index) => clamp01(0.035 + (index === activeBody ? onset * 0.93 : onset * 0.08)));
  const lockedSection = /peak|body-4|release/i.test(String(signal.section ?? ""));
  return Object.freeze({
    leftStrike: strikes[0],
    centerStrike: strikes[1],
    rightStrike: strikes[2],
    cableTension: clamp01(0.08 + low * 0.74 + high * 0.1),
    gateLock: clamp01(0.06 + mid * 0.42 + (lockedSection ? 0.42 : 0) + onset * 0.1),
    cameraImpulse: clamp01(onset * 0.11),
    rootRoll: Math.sin(time * 0.12) * 0.035,
  });
}

function morphBindings(root) {
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

export function createTriuneGatePerformance({ stage, asset }) {
  if (!stage?.scene || !stage?.camera) throw new TypeError("TRIUNE GATE requires a VJ stage");
  if (!asset?.gltf?.scene || !asset?.root) throw new TypeError("TRIUNE GATE requires a loaded runtime asset");
  const world = asset.gltf.scene;
  const root = asset.root;
  const bindings = morphBindings(root);
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
        emissiveIntensity: (material.emissiveIntensity ?? 0) * (/GateLock/i.test(node.name) ? 1.8 : 1),
      });
    }
    if (/GateLock/i.test(node.name)) bloomObjects.push(node);
  });

  const lights = new THREE.Group();
  lights.name = "TRIUNE_GATE_LIGHTS";
  lights.add(new THREE.HemisphereLight(0xe3e7df, 0x09080c, 1.45));
  const key = new THREE.DirectionalLight(0xe9efe7, 6.8);
  key.position.set(-5, 6.5, 8);
  key.castShadow = stage.quality?.shadows ?? false;
  lights.add(key);
  const killLight = new THREE.PointLight(0xff3a22, 28, 16, 2);
  killLight.position.set(0, 0.4, 4.5);
  lights.add(killLight);
  const acidRim = new THREE.PointLight(0xd9ff32, 15, 15, 2);
  acidRim.position.set(4.8, 2.8, -3.8);
  lights.add(acidRim);
  const cyanRim = new THREE.PointLight(0x44e7ff, 12, 14, 2);
  cyanRim.position.set(-4.4, -1.5, -4.5);
  lights.add(cyanRim);

  const current = { leftStrike: 0, centerStrike: 0, rightStrike: 0, gateLock: 0, cableTension: 0 };
  let envelope = 0;
  let mounted = false;
  let disposed = false;
  let currentTime = 0;

  function applyEnvelope() {
    for (const [material, base] of materials) {
      material.opacity = base.opacity * envelope;
      material.transparent = envelope < 0.999 || base.transparent;
      material.emissiveIntensity = base.emissiveIntensity * envelope;
      material.needsUpdate = true;
    }
    killLight.intensity = 28 * envelope;
    acidRim.intensity = 15 * envelope;
  }

  return {
    mount() {
      if (mounted || disposed) return false;
      mounted = true;
      const compact = stage.camera.aspect < 0.8;
      world.scale.setScalar(compact ? 1.15 : 1.04);
      world.position.set(0, -0.15, 0);
      stage.scene.add(world, lights);
      bloomObjects.forEach((object) => stage.addBloom?.(object));
      stage.camera.position.set(0, 0.25, compact ? 26.5 : 12.2);
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
      const state = computeTriuneGateState(signal);
      currentTime = Math.max(0, finite(frame.currentTime, signal.time));
      const response = Math.min(1, Math.max(0, delta) * 13);
      for (const key of Object.keys(current)) current[key] += (state[key] - current[key]) * response;
      setMorph(bindings, "left_strike", current.leftStrike);
      setMorph(bindings, "center_strike", current.centerStrike);
      setMorph(bindings, "right_strike", current.rightStrike);
      setMorph(bindings, "gate_lock", current.gateLock);
      setMorph(bindings, "cable_tension", current.cableTension);
      root.rotation.z = state.rootRoll;
      killLight.intensity = (18 + state.gateLock * 28) * envelope;
      if (stage.quality?.cameraTravel) {
        const compact = stage.camera.aspect < 0.8;
        const impulse = stage.quality?.impactShake ? state.cameraImpulse : 0;
        stage.camera.position.x = Math.sin(currentTime * 0.16) * 0.34 + Math.sin(currentTime * 51) * impulse;
        stage.camera.position.y = 0.25 + Math.cos(currentTime * 0.12) * 0.14;
        stage.camera.position.z = (compact ? 26.5 : 12.2) - current.gateLock * 0.45;
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
      return true;
    },
  };
}

export async function loadTriuneGateModule({ stage, onProgress } = {}) {
  const asset = await loadPulseWorldAsset({
    worldId: "triune-gate",
    renderer: stage?.renderer,
    quality: stage?.quality,
    onProgress,
    transcoderPath: "./assets/basis/",
  });
  return Object.freeze({ createPerformance: () => createTriuneGatePerformance({ stage, asset }) });
}
