function asDisposable(value) {
  if (typeof value === "function") return value;
  if (value && typeof value.dispose === "function") return () => value.dispose();
  throw new TypeError("Resource must be a callback or expose dispose()");
}

export function createResourceDisposer() {
  const callbacks = [];
  let disposed = false;

  return Object.freeze({
    add(resource) {
      if (disposed) throw new Error("Resource disposer has already been disposed");
      callbacks.push(asDisposable(resource));
      return resource;
    },
    dispose() {
      if (disposed) return false;
      disposed = true;
      for (let index = callbacks.length - 1; index >= 0; index -= 1) callbacks[index]();
      callbacks.length = 0;
      return true;
    },
    get disposed() {
      return disposed;
    },
  });
}

export function disposeObjectTree(root) {
  if (!root || typeof root.traverse !== "function") return false;
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();

  root.traverse((object) => {
    if (object?.geometry?.dispose) geometries.add(object.geometry);
    const candidates = Array.isArray(object?.material) ? object.material : [object?.material];
    for (const material of candidates) {
      if (!material?.dispose) continue;
      materials.add(material);
      for (const value of Object.values(material)) {
        if (value?.isTexture && value.dispose) textures.add(value);
      }
    }
  });

  for (const geometry of geometries) geometry.dispose();
  for (const texture of textures) texture.dispose();
  for (const material of materials) material.dispose();
  return true;
}
