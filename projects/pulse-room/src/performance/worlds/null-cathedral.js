import * as THREE from "three";

import { loadPulseWorldAsset } from "../../assets/runtime-loader.js";
import { disposeObjectTree } from "../resource-disposal.js";

const TAU = Math.PI * 2;
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.min(1, Math.max(0, finite(value)));

function sectionHash(section) {
  const source = typeof section === "string" ? section : "realtime";
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 0xffffffff;
}

function sectionProgress(section) {
  const value = String(section ?? "").toLowerCase();
  if (/release|outro|ending/.test(value)) return 1;
  if (/break/.test(value)) return 0.92;
  if (/peak|drop|climax/.test(value)) return 0.84;
  if (/body|verse|chorus|bridge/.test(value)) return 0.46;
  return 0.08;
}

export function computeNullCathedralState(signal = {}, { reducedMotion = false } = {}) {
  const time = Math.max(0, finite(signal.time));
  const low = clamp01(signal.low);
  const mid = clamp01(signal.mid);
  const high = clamp01(signal.high);
  const onset = clamp01(signal.onset);
  const progress = sectionProgress(signal.section);
  const offset = sectionHash(signal.section);
  const peak = /peak|drop|climax/i.test(String(signal.section ?? ""));
  const release = /release|outro|ending/i.test(String(signal.section ?? ""));

  return Object.freeze({
    shellReveal: clamp01(0.08 + progress * 0.62 + mid * 0.18),
    voidCross: clamp01((peak ? 0.78 : release ? 0.34 : 0.04) + high * 0.12 + onset * 0.06),
    scaleReveal: clamp01(progress + high * 0.08),
    relicIdle: clamp01(0.34 + Math.sin(time * 0.035 + offset * TAU) * 0.075 + low * 0.04),
    transmission: clamp01(0.22 + mid * 0.35 + high * 0.28),
    cameraTravel: reducedMotion ? 0 : progress,
    cameraPhase: reducedMotion ? 0 : progress + (offset - 0.5) * 0.08,
    rootYaw: Math.sin(time * 0.018 + offset * TAU) * 0.04,
    rootPitch: Math.cos(time * 0.014 + offset * TAU) * 0.025,
    sectionOffset: offset,
  });
}

export function computeNullCathedralCameraFrame(state = {}, { aspect = 1, time = 0 } = {}) {
  const portrait = finite(aspect, 1) < 0.8;
  const travel = clamp01(state.cameraTravel);
  const currentTime = Math.max(0, finite(time));
  const nearDistance = portrait ? 26 : 15.5;
  const farDistance = portrait ? 31 : 21;
  return Object.freeze({
    fov: portrait ? 46 : 36,
    distance: THREE.MathUtils.lerp(nearDistance, farDistance, travel),
    x: THREE.MathUtils.lerp(-0.6, 5.8, travel) + Math.sin(currentTime * 0.012) * 0.16,
    y: THREE.MathUtils.lerp(0.55, -1.6, travel) + Math.cos(currentTime * 0.01) * 0.1,
    targetX: THREE.MathUtils.lerp(0.45, 0.8, travel),
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

function seeded(index, channel) {
  const value = Math.sin(index * 12.9898 + channel * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function createScaleDebris(count) {
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (seeded(index, 2) - 0.5) * 27;
    positions[index * 3 + 1] = (seeded(index, 5) - 0.5) * 12;
    positions[index * 3 + 2] = -9 + seeded(index, 8) * 20;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0x9ccfd6,
    size: 0.018,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const points = new THREE.Points(geometry, material);
  points.name = "CATHEDRAL_FOREGROUND_SCALE_DEBRIS";
  return points;
}

export function createNullCathedralPerformance({ stage, asset }) {
  if (!stage?.scene || !stage?.camera) throw new TypeError("NULL CATHEDRAL requires a VJ stage");
  if (!asset?.gltf?.scene || !asset?.root) throw new TypeError("NULL CATHEDRAL requires a loaded runtime asset");

  const world = asset.gltf.scene;
  const root = asset.root;
  const bindings = bindMorphTargets(root);
  const materials = new Map();
  const bloomObjects = [];
  world.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = false;
    node.receiveShadow = true;
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
      if (!material || materials.has(material)) continue;
      materials.set(material, {
        opacity: material.opacity,
        transparent: material.transparent,
        emissiveIntensity: material.emissiveIntensity ?? 0,
      });
    }
    if (/ScaleLights|DepthLight/i.test(`${node.name} ${node.material?.name ?? ""}`)) bloomObjects.push(node);
  });

  const lights = new THREE.Group();
  lights.name = "NULL_CATHEDRAL_LIGHTS";
  lights.add(new THREE.HemisphereLight(0xaac7ca, 0x08040f, 0.75));
  const paleKey = new THREE.DirectionalLight(0xe6ece6, 4.2);
  paleKey.position.set(-7, 6, 9);
  lights.add(paleKey);
  const cyanDepth = new THREE.PointLight(0x44e7ff, 22, 24, 2);
  cyanDepth.position.set(2.4, -2.2, -3.8);
  lights.add(cyanDepth);
  const violetTransmission = new THREE.PointLight(0x7557ff, 18, 20, 2);
  violetTransmission.position.set(-3.8, 2.6, -5.2);
  lights.add(violetTransmission);

  const debris = createScaleDebris(Math.max(90, Math.floor((stage.quality?.particleBudget ?? 360) * 0.36)));
  const current = { shellReveal: 0, voidCross: 0, scaleReveal: 0, relicIdle: 0 };
  const initialFov = stage.camera.fov;
  const initialFogDensity = stage.scene.fog?.density;
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
    debris.material.opacity = envelope * 0.28;
    cyanDepth.intensity = 22 * envelope;
    violetTransmission.intensity = 18 * envelope;
  };

  return {
    mount() {
      if (mounted || disposed) return false;
      mounted = true;
      world.scale.setScalar(stage.camera.aspect < 0.8 ? 0.86 : 1.04);
      world.position.set(0.25, -0.1, 0);
      stage.scene.add(world, lights, debris);
      bloomObjects.forEach((object) => stage.addBloom?.(object));
      const frame = computeNullCathedralCameraFrame(
        computeNullCathedralState({ time: 0, section: "intro-1" }, { reducedMotion: stage.quality?.reducedMotion }),
        { aspect: stage.camera.aspect, time: 0 },
      );
      stage.camera.fov = frame.fov;
      stage.camera.updateProjectionMatrix();
      stage.camera.position.set(frame.x, frame.y, frame.distance);
      stage.camera.lookAt(frame.targetX, 0, 0);
      if (stage.scene.fog) stage.scene.fog.density = 0.032;
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
      const state = computeNullCathedralState(signal, { reducedMotion: stage.quality?.reducedMotion });
      currentTime = Math.max(0, finite(frame.currentTime, signal.time));
      const response = Math.min(1, Math.max(0, delta) * 3.2);
      for (const key of Object.keys(current)) current[key] += (state[key] - current[key]) * response;
      setMorph(bindings, "shell_reveal", current.shellReveal);
      setMorph(bindings, "void_cross", current.voidCross);
      setMorph(bindings, "scale_reveal", current.scaleReveal);
      setMorph(bindings, "relic_idle", current.relicIdle);
      root.rotation.y = state.rootYaw;
      root.rotation.x = state.rootPitch;
      cyanDepth.intensity = (12 + state.transmission * 24) * envelope;
      violetTransmission.intensity = (9 + state.transmission * 19) * envelope;
      debris.rotation.y = currentTime * 0.0025;

      const cameraFrame = computeNullCathedralCameraFrame(state, { aspect: stage.camera.aspect, time: currentTime });
      stage.camera.fov = cameraFrame.fov;
      stage.camera.position.set(cameraFrame.x, cameraFrame.y, cameraFrame.distance);
      stage.camera.lookAt(cameraFrame.targetX, 0, 0);
      if (stage.scene.fog) stage.scene.fog.density = THREE.MathUtils.lerp(0.05, 0.022, state.scaleReveal);
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
      stage.scene.remove(world, lights, debris);
      debris.geometry.dispose();
      debris.material.dispose();
      disposeObjectTree(world);
      stage.camera.fov = initialFov;
      stage.camera.updateProjectionMatrix();
      if (stage.scene.fog && Number.isFinite(initialFogDensity)) stage.scene.fog.density = initialFogDensity;
      return true;
    },
  };
}

export async function loadNullCathedralModule({ stage, onProgress } = {}) {
  const asset = await loadPulseWorldAsset({
    worldId: "null-cathedral",
    renderer: stage?.renderer,
    quality: stage?.quality,
    onProgress,
    transcoderPath: "./assets/basis/",
  });
  return Object.freeze({ createPerformance: () => createNullCathedralPerformance({ stage, asset }) });
}
