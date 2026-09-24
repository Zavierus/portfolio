import { validateListenerArtifactScene } from "../assets/listener-artifact-contract.js";

const clamp01 = (value) => Math.min(1, Math.max(0, Number(value) || 0));
export const LISTENER_WORLD_SCALE = 0.42;

function listMaterials(node) {
  if (!node?.material) return [];
  return Array.isArray(node.material) ? node.material : [node.material];
}

export class ListenerArtifactController {
  constructor({ scene, asset, quality = "high" } = {}) {
    if (!scene || typeof scene.add !== "function" || typeof scene.remove !== "function") {
      throw new TypeError("Listener artifact requires a mountable scene");
    }
    if (!asset?.gltf?.scene || typeof asset.gltf.scene.traverse !== "function") {
      throw new TypeError("Listener artifact requires a loaded glTF scene");
    }

    this.scene = scene;
    this.asset = asset;
    this.gltfScene = asset.gltf.scene;
    const contract = validateListenerArtifactScene(this.gltfScene);
    this.root = contract.root;
    this.root.scale?.multiplyScalar?.(LISTENER_WORLD_SCALE);
    this.morphBindings = contract.morphBindings;
    this.materials = contract.materials;
    this.materialDefaults = new Map(this.materials.map((material) => [material, Object.freeze({
      opacity: material.opacity,
      emissiveIntensity: material.emissiveIntensity,
    })]));
    this.quality = quality;
    this.mounted = false;
    this.disposed = false;
    this.mount();
    this.setQuality(quality);
  }

  mount() {
    if (this.disposed || this.mounted) return false;
    this.scene.add(this.gltfScene);
    this.mounted = true;
    return true;
  }

  update(listenerState = {}) {
    if (this.disposed) return false;
    const values = {
      shell_open: clamp01(listenerState.archiveOpen),
      membrane_tension: clamp01(listenerState.membraneTension),
      core_exposure: clamp01(listenerState.coreExposure),
      balance_shift: clamp01(listenerState.balanceOffset),
      signal_sweep: clamp01(listenerState.scanResponse),
    };
    for (const [name, bindings] of Object.entries(this.morphBindings)) {
      for (const { influences, index } of bindings) influences[index] = values[name];
    }

    if (Array.isArray(listenerState.position) && listenerState.position.length >= 3) {
      this.root.position?.fromArray?.(listenerState.position);
    }
    const rotationY = Number(listenerState.rotationY);
    if (this.root.rotation && Number.isFinite(rotationY)) this.root.rotation.y = rotationY;
    return true;
  }

  setQuality(level) {
    if (this.disposed || !["high", "medium", "low"].includes(level)) return false;
    this.quality = level;
    this.root.traverse((node) => {
      if (!node?.isMesh) return;
      node.castShadow = level === "high";
      node.receiveShadow = level !== "low";
    });
    return true;
  }

  dispose() {
    if (this.disposed) return false;
    this.disposed = true;
    if (this.mounted) this.scene.remove(this.gltfScene);
    this.mounted = false;

    const geometries = new Set();
    const materials = new Set();
    const textures = new Set();
    this.gltfScene.traverse((node) => {
      if (node?.geometry) geometries.add(node.geometry);
      for (const material of listMaterials(node)) {
        if (!material) continue;
        materials.add(material);
        for (const value of Object.values(material)) {
          if (value?.isTexture) textures.add(value);
        }
      }
    });
    textures.forEach((texture) => texture.dispose?.());
    materials.forEach((material) => material.dispose?.());
    geometries.forEach((geometry) => geometry.dispose?.());
    return true;
  }
}
