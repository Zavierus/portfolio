import * as THREE from "three";

import { loadPulseWorldAsset } from "../../assets/runtime-loader.js";
import { disposeObjectTree } from "../resource-disposal.js";

const TAU = Math.PI * 2;
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.min(1, Math.max(0, finite(value)));

function seeded(index, channel) {
  const value = Math.sin(index * 12.9898 + channel * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function sectionFamily(section) {
  const value = String(section ?? "").toLowerCase();
  if (/release|outro|ending/.test(value)) return 3;
  if (/peak|drop|climax/.test(value)) return 2;
  if (/body|verse|chorus|bridge|break/.test(value)) return 1;
  return 0;
}

export function computePacketBloomState(signal = {}) {
  const time = Math.max(0, finite(signal.time));
  const low = clamp01(signal.low);
  const mid = clamp01(signal.mid);
  const high = clamp01(signal.high);
  const onset = clamp01(signal.onset);
  const barPhase = clamp01(signal.barPhase);
  const family = sectionFamily(signal.section);
  const peak = family === 2;
  const release = family === 3;

  return Object.freeze({
    latticeBend: clamp01(0.08 + low * 0.76 + onset * 0.08),
    fibreBraid: clamp01(0.1 + mid * 0.68 + Math.sin(barPhase * TAU) * 0.04),
    clusterBreak: clamp01(0.04 + onset * 0.78 + (peak ? 0.36 : 0)),
    clusterRebuild: clamp01((release ? 0.9 : family === 1 ? 0.58 : 0.16) + (1 - onset) * 0.08),
    packetIdle: clamp01(0.28 + Math.sin(time * 0.6 + barPhase * TAU) * 0.16 + high * 0.14),
    trailIntensity: clamp01(0.06 + high * 0.76 + onset * 0.12),
    cameraImpulse: Math.min(0.16, onset * 0.16),
    shotIndex: family % 3,
  });
}

export function computePacketBloomCameraFrame(state = {}, { aspect = 1, time = 0 } = {}) {
  const portrait = finite(aspect, 1) < 0.8;
  const shot = Math.max(0, Math.min(2, Math.round(finite(state.shotIndex))));
  const currentTime = Math.max(0, finite(time));
  const impulse = Math.min(0.16, Math.max(0, finite(state.cameraImpulse)));
  const shotX = [-1.05, 0.25, 1.28][shot];
  const shotY = [0.38, -0.18, 0.62][shot];
  return Object.freeze({
    fov: portrait ? 49 : 38,
    distance: portrait ? 23.5 + shot * 0.8 : 13.3 + shot * 0.65,
    x: shotX + Math.sin(currentTime * 0.22) * 0.24 + Math.sin(currentTime * 47) * impulse,
    y: shotY + Math.cos(currentTime * 0.17) * 0.18,
    targetX: shot === 2 ? 0.65 : -0.1,
  });
}

export function createPacketBloomShardMatrices(count, state = {}) {
  const safeCount = Math.max(0, Math.floor(finite(count)));
  const output = new Float32Array(safeCount * 16);
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const euler = new THREE.Euler();
  const breakAmount = clamp01(state.clusterBreak);
  const rebuild = clamp01(state.clusterRebuild);
  for (let index = 0; index < safeCount; index += 1) {
    const t = 0.03 + seeded(index, 2) * 0.94;
    const lane = seeded(index, 5) * 2 - 1;
    const envelope = Math.sin(Math.PI * t) ** 0.58;
    position.set(
      -5.35 + t * 10.7,
      lane * envelope * 1.2,
      -2.75 + t * 5.5 + (seeded(index, 7) * 2 - 1) * envelope * 1.6,
    );
    position.x += (seeded(index, 11) * 2 - 1) * breakAmount * 2.8;
    position.y += (seeded(index, 13) * 2 - 1) * breakAmount * 2.2;
    position.z += (seeded(index, 17) * 2 - 1) * breakAmount * 2.6;
    position.y *= 1 - rebuild * 0.32;
    position.z += (-2.75 + t * 5.5 - position.z) * rebuild * 0.22;
    euler.set(
      (seeded(index, 19) - 0.5) * TAU + breakAmount,
      (seeded(index, 23) - 0.5) * TAU,
      0.72 + (seeded(index, 29) - 0.5) * 0.8 + breakAmount * 1.4,
    );
    quaternion.setFromEuler(euler);
    const length = 0.08 + seeded(index, 31) * 0.34 + clamp01(state.trailIntensity) * 0.18;
    scale.set(length, 0.018 + seeded(index, 37) * 0.05, 0.012 + seeded(index, 41) * 0.028);
    matrix.compose(position, quaternion, scale);
    matrix.toArray(output, index * 16);
  }
  return output;
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

function createRuntimePackets(count, color, name) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.name = name;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  return mesh;
}

export function createPacketBloomPerformance({ stage, asset }) {
  if (!stage?.scene || !stage?.camera) throw new TypeError("PACKET BLOOM requires a VJ stage");
  if (!asset?.gltf?.scene || !asset?.root) throw new TypeError("PACKET BLOOM requires a loaded runtime asset");

  const world = asset.gltf.scene;
  const root = asset.root;
  const bindings = bindMorphTargets(root);
  const materials = new Map();
  const bloomObjects = [];
  let fibres = null;
  world.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = stage.quality?.shadows ?? false;
    node.receiveShadow = true;
    if (/LuminousFibres/i.test(node.name)) fibres = node;
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
      if (!material || materials.has(material)) continue;
      materials.set(material, {
        opacity: material.opacity,
        transparent: material.transparent,
        emissiveIntensity: (material.emissiveIntensity ?? 0) * (
          /Cluster|Packet|Error/i.test(material.name) ? 0.18 : /Fibre/i.test(material.name) ? 0.3 : 1
        ),
      });
    }
    if (/Fibre/i.test(node.name)) bloomObjects.push(node);
  });

  const packetCount = Math.max(90, Math.floor((stage.quality?.particleBudget ?? 360) * 0.24));
  const cyanPackets = createRuntimePackets(Math.ceil(packetCount / 2), 0x44e7ff, "BLOOM_RUNTIME_CYAN_PACKETS");
  const acidPackets = createRuntimePackets(Math.floor(packetCount / 2), 0xd9ff32, "BLOOM_RUNTIME_ACID_PACKETS");
  const lights = new THREE.Group();
  lights.name = "PACKET_BLOOM_LIGHTS";
  lights.add(new THREE.HemisphereLight(0xb9c9c4, 0x080308, 1.0));
  const key = new THREE.DirectionalLight(0xe5ebe4, 3.6);
  key.position.set(-4.5, 5.2, 8);
  lights.add(key);
  const cyanLight = new THREE.PointLight(0x44e7ff, 11, 18, 2);
  cyanLight.position.set(2.6, 1.4, 2.8);
  lights.add(cyanLight);
  const acidLight = new THREE.PointLight(0xd9ff32, 9, 14, 2);
  acidLight.position.set(-2.8, -1.4, 3.5);
  lights.add(acidLight);
  const errorLight = new THREE.PointLight(0xff3a22, 6, 11, 2);
  errorLight.position.set(0.8, 2.2, -1.4);
  lights.add(errorLight);

  const current = { latticeBend: 0, clusterBreak: 0, clusterRebuild: 0, packetIdle: 0, fibreBraid: 0 };
  const initialFov = stage.camera.fov;
  let envelope = 0;
  let mounted = false;
  let disposed = false;
  let currentTime = 0;

  const updatePacketMesh = (mesh, state, offset) => {
    const matrices = createPacketBloomShardMatrices(mesh.count, {
      ...state,
      clusterBreak: clamp01(state.clusterBreak + offset * 0.08),
    });
    mesh.instanceMatrix.array.set(matrices);
    mesh.instanceMatrix.needsUpdate = true;
  };

  const applyEnvelope = () => {
    for (const [material, base] of materials) {
      material.opacity = base.opacity * envelope;
      material.transparent = envelope < 0.999 || base.transparent;
      material.emissiveIntensity = base.emissiveIntensity * envelope;
      material.needsUpdate = true;
    }
    cyanPackets.material.opacity = envelope * 0.12;
    acidPackets.material.opacity = envelope * 0.1;
    cyanLight.intensity = 11 * envelope;
    acidLight.intensity = 9 * envelope;
    errorLight.intensity = 6 * envelope;
  };

  return {
    mount() {
      if (mounted || disposed) return false;
      mounted = true;
      world.scale.setScalar(stage.camera.aspect < 0.8 ? 0.84 : 0.92);
      world.position.set(0, -0.15, 0);
      stage.scene.add(world, lights, cyanPackets, acidPackets);
      [...bloomObjects, cyanPackets, acidPackets].forEach((object) => stage.addBloom?.(object));
      const frame = computePacketBloomCameraFrame({ shotIndex: 0 }, { aspect: stage.camera.aspect, time: 0 });
      stage.camera.fov = frame.fov;
      stage.camera.updateProjectionMatrix();
      stage.camera.position.set(frame.x, frame.y, frame.distance);
      stage.camera.lookAt(frame.targetX, 0, 0);
      updatePacketMesh(cyanPackets, {}, 0);
      updatePacketMesh(acidPackets, {}, 1);
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
      const state = computePacketBloomState(signal);
      currentTime = Math.max(0, finite(frame.currentTime, signal.time));
      const response = Math.min(1, Math.max(0, delta) * 10);
      for (const key of Object.keys(current)) current[key] += (state[key] - current[key]) * response;
      setMorph(bindings, "lattice_bend", current.latticeBend);
      setMorph(bindings, "cluster_break", current.clusterBreak);
      setMorph(bindings, "cluster_rebuild", current.clusterRebuild);
      setMorph(bindings, "packet_idle", current.packetIdle);
      if (fibres) {
        fibres.rotation.x = (current.fibreBraid - 0.5) * 0.08;
        fibres.scale.y = 0.96 + current.fibreBraid * 0.08;
      }
      root.rotation.y = Math.sin(currentTime * 0.12) * 0.035;
      root.rotation.z = Math.sin(currentTime * 0.08) * 0.018;
      updatePacketMesh(cyanPackets, state, 0);
      updatePacketMesh(acidPackets, state, 1);
      cyanPackets.material.opacity = envelope * (0.05 + state.trailIntensity * 0.22);
      acidPackets.material.opacity = envelope * (0.04 + state.trailIntensity * 0.18);
      cyanLight.intensity = (7 + state.trailIntensity * 13) * envelope;
      acidLight.intensity = (6 + state.fibreBraid * 10) * envelope;
      errorLight.intensity = (3 + state.clusterBreak * 9) * envelope;

      const cameraState = stage.quality?.cameraTravel
        ? state
        : { ...state, shotIndex: 1, cameraImpulse: 0 };
      const cameraFrame = computePacketBloomCameraFrame(cameraState, { aspect: stage.camera.aspect, time: currentTime });
      stage.camera.fov = cameraFrame.fov;
      stage.camera.position.set(cameraFrame.x, cameraFrame.y, cameraFrame.distance);
      stage.camera.lookAt(cameraFrame.targetX, 0, 0);
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
      [...bloomObjects, cyanPackets, acidPackets].forEach((object) => stage.removeBloom?.(object));
      stage.scene.remove(world, lights, cyanPackets, acidPackets);
      for (const packets of [cyanPackets, acidPackets]) {
        packets.geometry.dispose();
        packets.material.dispose();
      }
      disposeObjectTree(world);
      stage.camera.fov = initialFov;
      stage.camera.updateProjectionMatrix();
      return true;
    },
  };
}

export async function loadPacketBloomModule({ stage, onProgress } = {}) {
  const asset = await loadPulseWorldAsset({
    worldId: "packet-bloom",
    renderer: stage?.renderer,
    quality: stage?.quality,
    onProgress,
    transcoderPath: "./assets/basis/",
  });
  return Object.freeze({ createPerformance: () => createPacketBloomPerformance({ stage, asset }) });
}
