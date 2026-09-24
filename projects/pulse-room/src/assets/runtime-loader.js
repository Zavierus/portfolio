import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

import manifest from "../../assets/asset-manifest.json" with { type: "json" };

const assetsById = new Map(manifest.assets.map((asset) => [asset.id, asset]));

export class PulseWorldAssetError extends Error {
  constructor(code, message, details = {}, cause) {
    super(message, cause ? { cause } : undefined);
    this.name = "PulseWorldAssetError";
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

function worldAsset(worldId) {
  const asset = assetsById.get(worldId);
  if (!asset) throw new PulseWorldAssetError("UNKNOWN_WORLD", `Unknown PULSE world: ${worldId}`, { worldId });
  return asset;
}

export function selectPulseWorldAsset(worldId, quality = {}) {
  const asset = worldAsset(worldId);
  const lod = quality?.lod === "low" || quality?.id === "low" ? "low" : "high";
  const target = asset.lods.find(({ level }) => level === lod);
  if (!target) throw new PulseWorldAssetError("MISSING_LOD", `${worldId} has no ${lod} LOD`, { worldId, lod });
  return Object.freeze({
    id: worldId,
    lod,
    url: `../../${target.path}`,
  });
}

export function validatePulseWorldAssetContract(gltf, worldId) {
  const asset = worldAsset(worldId);
  const root = gltf?.scene?.getObjectByName?.(asset.root);
  if (!root) {
    throw new PulseWorldAssetError("MISSING_ROOT", `${worldId} does not contain ${asset.root}`, { worldId, root: asset.root });
  }

  const morphs = new Set();
  root.traverse((node) => {
    for (const name of Object.keys(node.morphTargetDictionary ?? {})) morphs.add(name);
  });
  const missingMorphs = asset.controls.filter((name) => !morphs.has(name));
  if (missingMorphs.length) {
    throw new PulseWorldAssetError(
      "MISSING_MORPH_TARGET",
      `${worldId} is missing controls: ${missingMorphs.join(", ")}`,
      { worldId, missing: missingMorphs },
    );
  }

  const animationNames = new Set((gltf.animations ?? []).map(({ name }) => name));
  const missingAnimations = asset.animations.filter((name) => !animationNames.has(name));
  if (missingAnimations.length) {
    throw new PulseWorldAssetError(
      "MISSING_ANIMATION",
      `${worldId} is missing animations: ${missingAnimations.join(", ")}`,
      { worldId, missing: missingAnimations },
    );
  }

  return Object.freeze({ root, rootName: asset.root, controls: asset.controls, animations: gltf.animations });
}

export async function loadPulseWorldAsset({
  worldId,
  renderer,
  quality,
  onProgress = () => {},
  transcoderPath = "./assets/basis/",
} = {}) {
  if (!renderer) throw new TypeError("A WebGL renderer is required to load a PULSE world");
  if (typeof onProgress !== "function") throw new TypeError("onProgress must be a function");
  const target = selectPulseWorldAsset(worldId, quality);
  const ktx2Loader = new KTX2Loader().setTranscoderPath(transcoderPath).detectSupport(renderer);
  const loader = new GLTFLoader().setKTX2Loader(ktx2Loader).setMeshoptDecoder(MeshoptDecoder);

  try {
    const gltf = await new Promise((resolve, reject) => loader.load(
      target.url,
      resolve,
      ({ loaded = 0, total = 0 }) => onProgress(total > 0 ? loaded / total : 0, { loaded, total, ...target }),
      reject,
    ));
    const contract = validatePulseWorldAssetContract(gltf, worldId);
    onProgress(1, { loaded: 1, total: 1, ...target });
    return Object.freeze({ ...target, ...contract, gltf });
  } catch (error) {
    if (error instanceof PulseWorldAssetError) throw error;
    throw new PulseWorldAssetError("LOAD_FAILED", `Unable to load ${worldId}: ${target.url}`, target, error);
  } finally {
    ktx2Loader.dispose();
  }
}
